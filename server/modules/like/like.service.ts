import { and, count, desc, eq, inArray, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	attachmentsTable,
	bookmarksTable,
	commentLikesTable,
	commentsTable,
	postLikesTable,
	postsTable,
	profilesTable,
	user,
} from "@/drizzle/schema";
import { config } from "@/lib/config";
import type { ATTACHMENT_TYPES } from "@/lib/constants";
import type { likeSchema } from "./like.schema";

export class LikeProfileService {
	constructor(private db: typeof DBType) {}

	// --- AI GENERATED START ---
	async getLikesHistory({
		nextCursor,
		viewerId,
	}: z.infer<typeof likeSchema.profile.getLikesHistory.input> & {
		viewerId: string;
	}): Promise<z.infer<typeof likeSchema.profile.getLikesHistory.output>> {
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
					eq(userLikes.userId, viewerId),
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

		const hasUserBookmarkedQuery =
			posts.length > 0
				? await this.db
						.select({ postId: bookmarksTable.postId })
						.from(bookmarksTable)
						.where(
							and(
								eq(bookmarksTable.userId, viewerId),
								inArray(
									bookmarksTable.postId,
									posts.map((p) => p.id)
								)
							)
						)
				: [];

		const bookmarkedSet = new Set(hasUserBookmarkedQuery.map((r) => r.postId));

		const attachmentsMap = new Map<
			string,
			{ fileUrl: string; fileType: (typeof ATTACHMENT_TYPES)[number] }[]
		>();

		const postsWithAttachments = posts.filter((p) => p.hasAttachments);
		if (postsWithAttachments.length > 0) {
			const allAttachments = await this.db
				.select({
					postId: attachmentsTable.postId,
					fileUrl: attachmentsTable.fileUrl,
					fileType: attachmentsTable.fileType,
				})
				.from(attachmentsTable)
				.where(
					inArray(
						attachmentsTable.postId,
						postsWithAttachments.map((p) => p.id)
					)
				);

			for (const attachment of allAttachments) {
				if (!attachmentsMap.has(attachment.postId)) {
					attachmentsMap.set(attachment.postId, []);
				}
				attachmentsMap.get(attachment.postId)?.push({
					fileUrl: attachment.fileUrl,
					fileType: attachment.fileType,
				});
			}
		}

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

		const hasNextPage = items.length > config.POSTS_PAGINATION_LIMIT;
		const sliced = hasNextPage
			? items.slice(0, config.POSTS_PAGINATION_LIMIT)
			: items;

		return {
			items: sliced,
			nextCursor: hasNextPage
				? posts[config.POSTS_PAGINATION_LIMIT - 1].likedAt
				: null,
		};
	}
	// --- AI GENERATED END ---
}

export class LikePostService {
	constructor(private db: typeof DBType) {}

	private async getLikes({
		postId,
	}: {
		postId: string;
	}): Promise<{ count: number }> {
		const [{ count: likesCount }] = await this.db
			.select({ count: count() })
			.from(postLikesTable)
			.where(eq(postLikesTable.postId, postId));

		return {
			count: Number(likesCount),
		};
	}

	async add({
		postId,
		userId,
	}: z.infer<typeof likeSchema.post.add.input> & {
		userId: string;
	}): Promise<z.infer<typeof likeSchema.post.add.output>> {
		await this.db
			.insert(postLikesTable)
			.values({
				postId,
				userId,
			})
			.onConflictDoNothing();

		const { count } = await this.getLikes({ postId });

		return {
			count,
		};
	}

	async remove({
		postId,
		userId,
	}: z.infer<typeof likeSchema.post.remove.input> & {
		userId: string;
	}): Promise<z.infer<typeof likeSchema.post.remove.output>> {
		await this.db
			.delete(postLikesTable)
			.where(
				and(
					eq(postLikesTable.postId, postId),
					eq(postLikesTable.userId, userId)
				)
			);

		const { count } = await this.getLikes({ postId });

		return {
			count,
		};
	}
}

export class LikeCommentService {
	constructor(private db: typeof DBType) {}

	private async getLikes({
		commentId,
	}: {
		commentId: string;
	}): Promise<{ count: number }> {
		const likesCount = await this.db
			.select({ count: count() })
			.from(commentLikesTable)
			.where(eq(commentLikesTable.commentId, commentId));

		return {
			count: Number(likesCount[0].count),
		};
	}

	async add({
		commentId,
		userId,
	}: z.infer<typeof likeSchema.comment.add.input> & {
		userId: string;
	}): Promise<z.infer<typeof likeSchema.comment.add.output>> {
		await this.db
			.insert(commentLikesTable)
			.values({
				commentId,
				userId,
			})
			.onConflictDoNothing();

		const { count } = await this.getLikes({ commentId });

		return {
			count,
		};
	}

	async remove({
		commentId,
		userId,
	}: z.infer<typeof likeSchema.comment.remove.input> & {
		userId: string;
	}): Promise<z.infer<typeof likeSchema.comment.remove.output>> {
		await this.db
			.delete(commentLikesTable)
			.where(
				and(
					eq(commentLikesTable.commentId, commentId),
					eq(commentLikesTable.userId, userId)
				)
			);

		const { count } = await this.getLikes({ commentId });

		return {
			count,
		};
	}
}
