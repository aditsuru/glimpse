/** biome-ignore-all lint/style/noNonNullAssertion: same as Post Service */
import { ORPCError } from "@orpc/server";
import {
	and,
	asc,
	count,
	desc,
	eq,
	getTableColumns,
	gt,
	inArray,
	isNull,
	lt,
	sql,
} from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { attachmentsTable, postsTable, profilesTable } from "@/db/schema";
import { bookmarksTable } from "@/db/schema/bookmarks";
import { commentLikesTable } from "@/db/schema/comment-likes";
import { commentsTable } from "@/db/schema/comments";
import { postLikesTable } from "@/db/schema/post-likes";
import { getSeenPostIdsSet, upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import { incrementTrendingScore } from "@/lib/server/redis-utils";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { getPostOutput, postSchema } from "../post/post.schema";
import type {
	commentSchema,
	getCommentOutput,
	getUserCommentOutput,
} from "./comment.schema";

export class CommentService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async create({
		body,
		postId,
		parentCommentId,
	}: z.infer<typeof commentSchema.create.input>): Promise<
		z.infer<typeof commentSchema.create.output>
	> {
		if (!body.trim())
			throw new ORPCError("BAD_REQUEST", {
				message: "Comment cannot be empty.",
			});

		const [inserted] = await this.db
			.insert(commentsTable)
			.values({
				body,
				postId,
				userId: this.userId,
				parentCommentId: parentCommentId ?? null,
			})
			.returning({ id: commentsTable.id });

		const [post, parentComment] = await Promise.all([
			this.db
				.select({ userId: postsTable.userId })
				.from(postsTable)
				.where(eq(postsTable.id, postId))
				.limit(1)
				.then((i) => i[0]),
			parentCommentId
				? this.db
						.select({ userId: commentsTable.userId })
						.from(commentsTable)
						.where(eq(commentsTable.id, parentCommentId))
						.limit(1)
						.then((i) => i[0])
				: Promise.resolve(null),
		]);

		const notifications: Promise<void>[] = [];

		if (post) {
			notifications.push(
				upsertNotification({
					type: "comment",
					recipientId: post.userId,
					actorId: this.userId,
					postId,
					commentId: inserted.id,
					body,
				}).catch((e) => logger.error({ err: e }, "notification failed"))
			);
		}

		if (
			parentComment &&
			parentComment.userId !== post?.userId &&
			parentComment.userId !== this.userId
		) {
			notifications.push(
				upsertNotification({
					type: "reply",
					recipientId: parentComment.userId,
					actorId: this.userId,
					postId,
					commentId: inserted.id,
					parentCommentId: parentCommentId as string,
					body,
				}).catch((e) => logger.error({ err: e }, "notification failed"))
			);
		}

		notifications.push(
			incrementTrendingScore(postId, "comment").catch((e) =>
				logger.error({ err: e }, "trending increment failed")
			)
		);

		void Promise.all(notifications);

		return { success: true };
	}

	async delete({
		commentId,
	}: z.infer<typeof commentSchema.delete.input>): Promise<
		z.infer<typeof commentSchema.delete.output>
	> {
		await this.db.delete(commentsTable).where(eq(commentsTable.id, commentId));

		return {
			success: true,
		};
	}

	async getCount({
		postId,
	}: z.infer<typeof commentSchema.getCount.input>): Promise<
		z.infer<typeof commentSchema.getCount.output>
	> {
		const data = await this.db
			.select({ count: count() })
			.from(commentsTable)
			.where(eq(commentsTable.postId, postId))
			.then((i) => i[0]);

		return { count: data.count };
	}

	async getPostComments({
		postId,
		cursor,
		highlight,
	}: z.infer<typeof commentSchema.getPostComments.input>): Promise<
		z.infer<typeof commentSchema.getPostComments.output>
	> {
		const selectColumns = {
			...getTableColumns(commentsTable),
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
			likesCount: sql<number>`(
				SELECT COUNT(*) FROM ${commentLikesTable}
				WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
			)::int`,
			isLikedByUser: sql<boolean>`(EXISTS (
					SELECT 1 FROM ${commentLikesTable}
					WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
					AND ${commentLikesTable.userId} = ${this.userId}
				))::boolean`,
			repliesCount: sql<number>`(
				SELECT COUNT(*) FROM comments r
				WHERE r.parent_comment_id = ${commentsTable.id}
			)::int`,
		};

		const rawComments = await this.db
			.select(selectColumns)
			.from(commentsTable)
			.leftJoin(profilesTable, eq(commentsTable.userId, profilesTable.userId))
			.where(
				and(
					eq(commentsTable.postId, postId),
					isNull(commentsTable.parentCommentId),
					cursor ? lt(commentsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(
				...(!cursor && highlight
					? [
							sql`CASE WHEN ${commentsTable.id} = ${highlight} THEN 1 ELSE 2 END`,
						]
					: []),
				desc(commentsTable.createdAt)
			)
			.groupBy(commentsTable.id, profilesTable.id)
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		const hasNext = rawComments.length > config.COMMENTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? rawComments.slice(0, -1) : rawComments;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		const comments = [...this.mapComments(trimmed)];

		const items = comments.sort((a, b) =>
			a.id === highlight ? -1 : b.id === highlight ? 1 : 0
		);

		return { items, nextCursor };
	}

	async getAllCommentsByUser({
		username,
		cursor,
	}: z.infer<typeof commentSchema.getAllCommentsByUser.input>): Promise<
		z.infer<typeof commentSchema.getAllCommentsByUser.output>
	> {
		const selectColumns = {
			...getTableColumns(commentsTable),
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
			likesCount: sql<number>`(
				SELECT COUNT(*) FROM ${commentLikesTable}
				WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
			)::int`,
			isLikedByUser: sql<boolean>`(EXISTS (
					SELECT 1 FROM ${commentLikesTable}
					WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
					AND ${commentLikesTable.userId} = ${this.userId}
				))::boolean`,
			repliesCount: sql<number>`(
				SELECT COUNT(*) FROM comments r
				WHERE r.parent_comment_id = ${commentsTable.id}
			)::int`,
		};

		const rawComments = await this.db
			.select(selectColumns)
			.from(commentsTable)
			.leftJoin(profilesTable, eq(commentsTable.userId, profilesTable.userId))
			.where(
				and(
					eq(profilesTable.username, username),
					cursor ? lt(commentsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(commentsTable.createdAt))
			.groupBy(commentsTable.id, profilesTable.id)
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		const hasNext = rawComments.length > config.COMMENTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? rawComments.slice(0, -1) : rawComments;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		const mapped = this.mapComments(trimmed);

		const replyComments = mapped.filter((c) => c.parentCommentId !== null);
		const topLevelComments = mapped.filter((c) => c.parentCommentId === null);

		const parentCommentIds = [
			...new Set(replyComments.map((c) => c.parentCommentId!)),
		];
		const postIds = [...new Set(topLevelComments.map((c) => c.postId))];

		const [rawParentComments, rawPosts, seenPostIds] = await Promise.all([
			parentCommentIds.length > 0
				? this.db
						.select(selectColumns)
						.from(commentsTable)
						.leftJoin(
							profilesTable,
							eq(commentsTable.userId, profilesTable.userId)
						)
						.where(inArray(commentsTable.id, parentCommentIds))
						.groupBy(commentsTable.id, profilesTable.id)
				: Promise.resolve([]),
			postIds.length > 0
				? this.db
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
								ORDER BY ${attachmentsTable.position} ASC
								) FILTER (WHERE ${attachmentsTable.id} IS NOT NULL)
								, '[]')
							`,
							likesCount: sql<number>`(
								SELECT COUNT(*) FROM ${postLikesTable}
								WHERE ${postLikesTable.postId} = ${postsTable.id}
							)::int`,
							isLikedByUser: sql<boolean>`(EXISTS (
								SELECT 1 FROM ${postLikesTable}
								WHERE ${postLikesTable.postId} = ${postsTable.id}
								AND ${postLikesTable.userId} = ${this.userId}
							))::boolean`,
							bookmarksCount: sql<number>`(
								SELECT COUNT(*) FROM ${bookmarksTable}
								WHERE ${bookmarksTable.postId} = ${postsTable.id}
							)::int`,
							isBookmarkedByUser: sql<boolean>`(EXISTS (
								SELECT 1 FROM ${bookmarksTable}
								WHERE ${bookmarksTable.postId} = ${postsTable.id}
								AND ${bookmarksTable.userId} = ${this.userId}
							))::boolean`,
							commentsCount: sql<number>`(
								SELECT COUNT(*) FROM ${commentsTable} c
								WHERE c.post_id = ${postsTable.id}
							)::int`,
						})
						.from(postsTable)
						.innerJoin(
							profilesTable,
							eq(postsTable.userId, profilesTable.userId)
						)
						.leftJoin(
							attachmentsTable,
							eq(attachmentsTable.postId, postsTable.id)
						)
						.where(inArray(postsTable.id, postIds))
						.groupBy(postsTable.id, profilesTable.id)
				: Promise.resolve([]),
			getSeenPostIdsSet(this.db, this.userId),
		]);

		const parentCommentMap = new Map(
			this.mapComments(rawParentComments).map((c) => [c.id, c])
		);

		const postMap = new Map(
			rawPosts.map((p) => [
				p.id,
				{ ...p, isSeenByViewer: seenPostIds.has(p.id) },
			])
		);
		return {
			items: this.mapUserComments(mapped, parentCommentMap, postMap),
			nextCursor,
		};
	}

	async getCommentReplies({
		commentId,
		cursor,
	}: z.infer<typeof commentSchema.getCommentReplies.input>): Promise<
		z.infer<typeof commentSchema.getCommentReplies.output>
	> {
		const selectColumns = {
			...getTableColumns(commentsTable),
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
			likesCount: sql<number>`(
				SELECT COUNT(*) FROM ${commentLikesTable}
				WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
			)::int`,
			isLikedByUser: sql<boolean>`(EXISTS (
					SELECT 1 FROM ${commentLikesTable}
					WHERE ${commentLikesTable.commentId} = ${commentsTable.id}
					AND ${commentLikesTable.userId} = ${this.userId}
				))::boolean`,

			repliesCount: sql<number>`0`,
		};

		const rawReplies = await this.db
			.select(selectColumns)
			.from(commentsTable)
			.leftJoin(profilesTable, eq(commentsTable.userId, profilesTable.userId))
			.where(
				and(
					eq(commentsTable.parentCommentId, commentId),
					cursor ? gt(commentsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(asc(commentsTable.createdAt))
			.groupBy(commentsTable.id, profilesTable.id)
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		const hasNext = rawReplies.length > config.COMMENTS_PAGINATION_LIMIT;
		const trimmed = hasNext ? rawReplies.slice(0, -1) : rawReplies;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		return {
			items: this.mapComments(trimmed),
			nextCursor,
		};
	}

	private mapComments(
		data: (z.infer<typeof getCommentOutput> & {
			authorAvatarUpdatedAt: Date | null;
		})[]
	) {
		return data.map((comment) => {
			return {
				...comment,
				author: {
					...comment.author,
					avatarUrl:
						comment.author.avatarUrl && comment.authorAvatarUpdatedAt
							? constructPublicUrl({
									key: comment.author.avatarUrl,
									updatedAt: comment.authorAvatarUpdatedAt,
								}).publicUrl
							: null,
				},
			};
		});
	}

	private mapUserComments(
		data: z.infer<typeof getCommentOutput>[],
		parentCommentMap: Map<string, z.infer<typeof getCommentOutput>>,
		postMap: Map<
			string,
			z.infer<typeof getPostOutput> & { authorAvatarUpdatedAt: Date | null }
		>
	): z.infer<typeof getUserCommentOutput>[] {
		return data.map((comment) => {
			if (comment.parentCommentId !== null) {
				return {
					...comment,
					context: {
						parentComment: parentCommentMap.get(comment.parentCommentId)!,
					},
				};
			}
			const rawPost = postMap.get(comment.postId)!;
			const post: z.infer<typeof getPostOutput> = {
				...rawPost,
				author: {
					...rawPost.author,
					avatarUrl:
						rawPost.author.avatarUrl && rawPost.authorAvatarUpdatedAt
							? constructPublicUrl({
									key: rawPost.author.avatarUrl,
									updatedAt: rawPost.authorAvatarUpdatedAt,
								}).publicUrl
							: null,
				},
				attachments: rawPost.attachments.map((a) => ({
					...a,
					url: constructPublicUrl({ key: a.url, updatedAt: rawPost.updatedAt })
						.publicUrl,
				})),
			};
			return {
				...comment,
				context: { post },
			};
		});
	}

	async adminDelete({
		commentId,
	}: z.infer<typeof commentSchema.adminDelete.input>): Promise<
		z.infer<typeof commentSchema.adminDelete.output>
	> {
		const comment = await this.db
			.select({ userId: commentsTable.userId })
			.from(commentsTable)
			.where(eq(commentsTable.id, commentId))
			.limit(1)
			.then((r) => r[0]);

		if (!comment) return { success: true };

		await this.db.delete(commentsTable).where(eq(commentsTable.id, commentId));

		void upsertNotification({
			type: "system",
			recipientId: comment.userId,
			body: "One of your comments was removed for violating our community guidelines.",
		}).catch((e) =>
			logger.error({ err: e }, "content removal notification failed")
		);

		return { success: true };
	}
}
