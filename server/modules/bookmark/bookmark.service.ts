import { and, count, desc, eq, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	bookmarksTable,
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
	fetchUserLikedPostIds,
	getInteractionCount,
} from "@/server/shared/queries/post";
import type { bookmarkSchema } from "./bookmark.schema";

export class BookmarkService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	// --- AI GENERATED START ---
	async getBookmarksHistory({
		nextCursor,
	}: z.infer<typeof bookmarkSchema.profile.getBookmarksHistory.input>): Promise<
		z.infer<typeof bookmarkSchema.profile.getBookmarksHistory.output>
	> {
		const userBookmarks = alias(bookmarksTable, "user_bookmarks");

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
				bookmarkedAt: userBookmarks.createdAt,
			})
			.from(postsTable)
			.innerJoin(
				userBookmarks,
				and(
					eq(userBookmarks.postId, postsTable.id),
					eq(userBookmarks.userId, this.userId),
					nextCursor ? lt(userBookmarks.createdAt, nextCursor) : undefined
				)
			)
			.leftJoin(postLikesTable, eq(postLikesTable.postId, postsTable.id))
			.leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
			.leftJoin(bookmarksTable, eq(bookmarksTable.postId, postsTable.id))
			.innerJoin(user, eq(user.id, postsTable.userId))
			.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
			.groupBy(postsTable.id, userBookmarks.createdAt)
			.orderBy(desc(userBookmarks.createdAt))
			.limit(config.POSTS_PAGINATION_LIMIT + 1);

		const likedSet = await fetchUserLikedPostIds(
			this.db,
			this.userId,
			posts.map((post) => post.id)
		);

		const attachmentsMap = await fetchAttachmentsMap(this.db, posts);

		const items = posts.map(({ bookmarkedAt, ...post }) => ({
			...post,
			likes: Number(post.likes),
			comments: Number(post.comments),
			bookmarks: Number(post.bookmarks),
			body: post.body ?? undefined,
			hasUserLiked: likedSet.has(post.id),
			hasUserBookmarked: true,
			attachments: attachmentsMap.get(post.id) ?? undefined,
		}));

		return paginateResult(
			items,
			config.PROFILE_PAGINATION_LIMIT,
			(item) => item.createdAt
		);
	}

	// --- AI GENERATED END ---

	async add({
		postId,
	}: z.infer<typeof bookmarkSchema.add.input>): Promise<
		z.infer<typeof bookmarkSchema.add.output>
	> {
		await this.db
			.insert(bookmarksTable)
			.values({
				postId,
				userId: this.userId,
			})
			.onConflictDoNothing();

		const { count } = await this.getBookmarks({ postId });

		return {
			count,
		};
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

		const { count } = await this.getBookmarks({ postId });

		return {
			count,
		};
	}

	private async getBookmarks({
		postId,
	}: {
		postId: string;
	}): Promise<{ count: number }> {
		return {
			count: await getInteractionCount(
				this.db,
				bookmarksTable,
				bookmarksTable.postId,
				postId
			),
		};
	}
}
