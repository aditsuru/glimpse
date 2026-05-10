/** biome-ignore-all lint/style/noNonNullAssertion: same as PostService */
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, getTableColumns, lt, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { attachmentsTable, postsTable, profilesTable } from "@/db/schema";
import { bookmarksTable } from "@/db/schema/bookmarks";
import { commentsTable } from "@/db/schema/comments";
import { postLikesTable } from "@/db/schema/post-likes";
import { getPostViewsBatch } from "@/lib/server/redis-utils";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { postSchema } from "../post/post.schema";
import type { postLikeSchema } from "./post-like.schema";

export class PostLikeService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		postId,
	}: z.infer<typeof postLikeSchema.get.input>): Promise<
		z.infer<typeof postLikeSchema.get.output>
	> {
		const data = await this.db
			.select({
				count: count(),
				isLikedByUser: sql<boolean>`
				bool_or(${postLikesTable.userId} = ${this.userId})
			`,
			})
			.from(postLikesTable)
			.where(eq(postLikesTable.postId, postId))
			.then((i) => i[0]);

		return data;
	}

	async getLikedPosts({
		cursor,
	}: z.infer<typeof postLikeSchema.getLikedPosts.input>): Promise<
		z.infer<typeof postLikeSchema.getLikedPosts.output>
	> {
		const posts = await this.db
			.select({
				...getTableColumns(postsTable),
				authorAvatarUpdatedAt: profilesTable.updatedAt,
				author: sql<z.infer<typeof postSchema.get.output.shape.author>>`
						json_build_object(
						'id', ${profilesTable.userId},
						'username', ${profilesTable.username},
						'displayName', ${profilesTable.displayName},
						'isGlimpseVerified', ${profilesTable.isGlimpseVerified},
						'avatarUrl', ${profilesTable.avatarKey}
						)
						`,
				attachments: sql<
					z.infer<typeof postSchema.get.output.shape.attachments>
				>`
						COALESCE(
						json_agg(
						json_build_object(
						'mimeType', ${attachmentsTable.mimeType},
						'url', ${attachmentsTable.attachmentKey}
						)
						ORDER BY ${attachmentsTable.createdAt} DESC
						) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL)
						, '[]')
						`,
				likesCount: this.db.$count(
					postLikesTable,
					eq(postsTable.id, postLikesTable.postId)
				),
				bookmarksCount: this.db.$count(
					bookmarksTable,
					eq(postsTable.id, bookmarksTable.postId)
				),
				isBookmarkedByUser: sql<boolean>`EXISTS (
					SELECT 1 FROM ${bookmarksTable}
					WHERE ${bookmarksTable.postId} = ${postsTable.id}
					AND ${bookmarksTable.userId} = ${this.userId}
				)`,
				commentsCount: this.db.$count(
					commentsTable,
					eq(postsTable.id, commentsTable.postId)
				),
			})
			.from(postsTable)
			.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
			.leftJoin(attachmentsTable, eq(postsTable.id, attachmentsTable.postId))
			.innerJoin(
				postLikesTable,
				and(
					eq(sql`${this.userId}`, postLikesTable.userId),
					eq(postsTable.id, postLikesTable.postId)
				)
			)
			.where(cursor ? lt(postsTable.createdAt, cursor) : undefined)
			.groupBy(postsTable.id, profilesTable.id, postLikesTable.createdAt)
			.orderBy(desc(postLikesTable.createdAt))
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const hasNext = posts.length > config.POSTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? posts.slice(0, -1) : posts;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		const viewsMap = await getPostViewsBatch(trimmed.map((p) => p.id));

		const mappedPosts = trimmed.map((post) => {
			return {
				...post,
				isLikedByUser: true,
				views: post.views + (viewsMap.get(post.id) ?? 0),
				author: {
					...post.author,
					avatarUrl: post.author.avatarUrl
						? constructPublicUrl({
								key: post.author.avatarUrl,
								updatedAt: post.authorAvatarUpdatedAt,
							}).publicUrl
						: null,
				},
				attachments: post.attachments.map((a) => {
					return {
						...a,
						url: constructPublicUrl({ key: a.url, updatedAt: post.updatedAt })
							.publicUrl,
					};
				}),
			};
		});

		return {
			items: mappedPosts,
			nextCursor,
		};
	}

	async add({
		postId,
	}: z.infer<typeof postLikeSchema.add.input>): Promise<
		z.infer<typeof postLikeSchema.add.output>
	> {
		try {
			await this.db
				.insert(postLikesTable)
				.values({
					userId: this.userId,
					postId,
				})
				.onConflictDoNothing();

			return {
				success: true,
			};
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23503") {
				throw new ORPCError("NOT_FOUND", { message: "Post not found." });
			}
			throw error;
		}
	}

	async remove({
		postId,
	}: z.infer<typeof postLikeSchema.remove.input>): Promise<
		z.infer<typeof postLikeSchema.remove.output>
	> {
		await this.db
			.delete(postLikesTable)
			.where(
				and(
					eq(postLikesTable.postId, postId),
					eq(postLikesTable.userId, this.userId)
				)
			);

		return {
			success: true,
		};
	}
}
