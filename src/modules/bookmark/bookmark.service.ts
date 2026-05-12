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
import type { bookmarkSchema } from "./bookmark.schema";

export class BookmarkService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		postId,
	}: z.infer<typeof bookmarkSchema.get.input>): Promise<
		z.infer<typeof bookmarkSchema.get.output>
	> {
		const data = await this.db
			.select({
				count: count(),
				isBookmarkedByUser: sql<boolean>`
					bool_or(${bookmarksTable.userId} = ${this.userId})
				`,
			})
			.from(bookmarksTable)
			.where(eq(bookmarksTable.postId, postId))
			.then((i) => i[0]);

		return data;
	}

	async getBookmarkedPosts({
		cursor,
	}: z.infer<typeof bookmarkSchema.getBookmarkedPosts.input>): Promise<
		z.infer<typeof bookmarkSchema.getBookmarkedPosts.output>
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
				isLikedByUser: sql<boolean>`EXISTS (
					SELECT 1 FROM ${postLikesTable}
					WHERE ${postLikesTable.postId} = ${postsTable.id}
					AND ${postLikesTable.userId} = ${this.userId}
				)`,
				bookmarksCount: this.db.$count(
					bookmarksTable,
					eq(postsTable.id, bookmarksTable.postId)
				),
				commentsCount: this.db.$count(
					commentsTable,
					eq(postsTable.id, commentsTable.postId)
				),
				bookmarkedAt: bookmarksTable.createdAt,
			})
			.from(postsTable)
			.innerJoin(profilesTable, eq(postsTable.userId, profilesTable.userId))
			.leftJoin(attachmentsTable, eq(postsTable.id, attachmentsTable.postId))
			.innerJoin(
				bookmarksTable,
				and(
					eq(sql`${this.userId}`, bookmarksTable.userId),
					eq(postsTable.id, bookmarksTable.postId)
				)
			)
			.where(cursor ? lt(bookmarksTable.createdAt, cursor) : undefined)
			.groupBy(postsTable.id, profilesTable.id, bookmarksTable.createdAt)
			.orderBy(desc(bookmarksTable.createdAt))
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const hasNext = posts.length > config.POSTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? posts.slice(0, -1) : posts;
		const nextCursor = hasNext ? trimmed.at(-1)!.bookmarkedAt : null;

		const viewsMap = await getPostViewsBatch(trimmed.map((p) => p.id));

		const mappedPosts = trimmed.map((post) => {
			return {
				...post,
				isBookmarkedByUser: true,
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
	}: z.infer<typeof bookmarkSchema.add.input>): Promise<
		z.infer<typeof bookmarkSchema.add.output>
	> {
		try {
			await this.db
				.insert(bookmarksTable)
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
	}: z.infer<typeof bookmarkSchema.remove.input>): Promise<
		z.infer<typeof bookmarkSchema.remove.output>
	> {
		await this.db
			.delete(bookmarksTable)
			.where(
				and(
					eq(bookmarksTable.postId, postId),
					eq(bookmarksTable.userId, this.userId)
				)
			);

		return {
			success: true,
		};
	}
}
