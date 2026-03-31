import { and, count, desc, eq, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	bookmarksTable,
	commentLikesTable,
	commentsTable,
	postLikesTable,
	postsTable,
	profilesTable,
	user,
} from "@/drizzle/schema";
import { config } from "@/lib/config";
import { paginateResult } from "@/server/shared/helpers/paginate";
import { fetchAttachmentsMap } from "@/server/shared/queries/attachments";
import {
	fetchUserBookmarkedPostIds,
	getInteractionCount,
} from "@/server/shared/queries/post";
import type { likeSchema } from "./like.schema";

export class LikeProfileService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	// --- AI GENERATED START ---
	async getLikesHistory({
		nextCursor,
	}: z.infer<typeof likeSchema.profile.getLikesHistory.input>): Promise<
		z.infer<typeof likeSchema.profile.getLikesHistory.output>
	> {
		const userLikes = alias(postLikesTable, "user_likes");

		const posts = await this.db
			.select({
				id: postsTable.id,
				body: postsTable.body,
				createdAt: postsTable.createdAt,
				hasAttachments: postsTable.hasAttachments,
				userId: postsTable.userId,
				views: postsTable.views,
				likes: count(postLikesTable.userId).as("likes"),
				comments: count(commentsTable.id).as("comments"),
				bookmarks: count(bookmarksTable.userId).as("bookmarks"),
				authorName: user.name,
				authorUsername: user.username,
				authorAvatarUrl: profilesTable.avatarUrl,
				authorIsVerified: profilesTable.isGlimpseVerified,
				likedAt: userLikes.createdAt,
			})
			.from(postsTable)
			.innerJoin(
				userLikes,
				and(
					eq(userLikes.postId, postsTable.id),
					eq(userLikes.userId, this.userId),
					nextCursor ? lt(userLikes.createdAt, nextCursor) : undefined
				)
			)
			.leftJoin(postLikesTable, eq(postLikesTable.postId, postsTable.id))
			.leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
			.leftJoin(bookmarksTable, eq(bookmarksTable.postId, postsTable.id))
			.innerJoin(user, eq(user.id, postsTable.userId))
			.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
			.groupBy(postsTable.id, userLikes.createdAt)
			.orderBy(desc(userLikes.createdAt))
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const bookmarkedSet = await fetchUserBookmarkedPostIds(
			this.db,
			this.userId,
			posts.map((post) => post.id)
		);

		const attachmentsMap = await fetchAttachmentsMap(this.db, posts);

		const items = posts.map(({ likedAt, ...post }) => ({
			...post,
			likes: Number(post.likes),
			comments: Number(post.comments),
			bookmarks: Number(post.bookmarks),
			body: post.body ?? undefined,
			hasUserLiked: true,
			hasUserBookmarked: bookmarkedSet.has(post.id),
			attachments: attachmentsMap.get(post.id) ?? undefined,
		}));

		return paginateResult(
			items,
			config.PROFILE_PAGINATION_LIMIT,
			(item) => item.createdAt
		);
	}
	// --- AI GENERATED END ---
}

export class LikePostService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	private async getLikes({
		postId,
	}: {
		postId: string;
	}): Promise<{ count: number }> {
		return {
			count: await getInteractionCount(
				this.db,
				postLikesTable,
				postLikesTable.postId,
				postId
			),
		};
	}

	async add({
		postId,
	}: z.infer<typeof likeSchema.post.add.input>): Promise<
		z.infer<typeof likeSchema.post.add.output>
	> {
		await this.db
			.insert(postLikesTable)
			.values({
				postId,
				userId: this.userId,
			})
			.onConflictDoNothing();

		const { count } = await this.getLikes({ postId });

		return {
			count,
		};
	}

	async remove({
		postId,
	}: z.infer<typeof likeSchema.post.remove.input>): Promise<
		z.infer<typeof likeSchema.post.remove.output>
	> {
		await this.db
			.delete(postLikesTable)
			.where(
				and(
					eq(postLikesTable.postId, postId),
					eq(postLikesTable.userId, this.userId)
				)
			);

		const { count } = await this.getLikes({ postId });

		return {
			count,
		};
	}
}

export class LikeCommentService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	private async getLikes({
		commentId,
	}: {
		commentId: string;
	}): Promise<{ count: number }> {
		return {
			count: await getInteractionCount(
				this.db,
				commentLikesTable,
				commentLikesTable.commentId,
				commentId
			),
		};
	}

	async add({
		commentId,
	}: z.infer<typeof likeSchema.comment.add.input>): Promise<
		z.infer<typeof likeSchema.comment.add.output>
	> {
		await this.db
			.insert(commentLikesTable)
			.values({
				commentId,
				userId: this.userId,
			})
			.onConflictDoNothing();

		const { count } = await this.getLikes({ commentId });

		return {
			count,
		};
	}

	async remove({
		commentId,
	}: z.infer<typeof likeSchema.comment.remove.input>): Promise<
		z.infer<typeof likeSchema.comment.remove.output>
	> {
		await this.db
			.delete(commentLikesTable)
			.where(
				and(
					eq(commentLikesTable.commentId, commentId),
					eq(commentLikesTable.userId, this.userId)
				)
			);

		const { count } = await this.getLikes({ commentId });

		return {
			count,
		};
	}
}
