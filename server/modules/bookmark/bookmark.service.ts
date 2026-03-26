import { and, count, desc, eq, inArray, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	attachmentsTable,
	bookmarksTable,
	commentsTable,
	postLikesTable,
	postsTable,
	profilesTable,
	user,
} from "@/drizzle/schema";
import { config } from "@/lib/config";
import type { ATTACHMENT_TYPES } from "@/lib/constants";
import type { bookmarkSchema } from "./bookmark.schema";

export class BookmarkService {
	constructor(private db: typeof DBType) {}

	// --- AI GENERATED START ---
	async getBookmarksHistory({
		nextCursor,
		viewerId,
	}: z.infer<typeof bookmarkSchema.profile.getBookmarksHistory.input> & {
		viewerId: string;
	}): Promise<
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
					eq(userBookmarks.userId, viewerId),
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

		const [hasUserLikedQuery, hasUserBookmarkedQuery] =
			posts.length > 0
				? await Promise.all([
						this.db
							.select({ postId: postLikesTable.postId })
							.from(postLikesTable)
							.where(
								and(
									eq(postLikesTable.userId, viewerId),
									inArray(
										postLikesTable.postId,
										posts.map((p) => p.id)
									)
								)
							),
						this.db
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
							),
					])
				: [[], []];

		const likedSet = new Set(hasUserLikedQuery.map((r) => r.postId));
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

		const items = posts.map(({ bookmarkedAt, ...post }) => ({
			...post,
			likes: Number(post.likes),
			comments: Number(post.comments),
			bookmarks: Number(post.bookmarks),
			body: post.body ?? undefined,
			hasUserLiked: likedSet.has(post.id),
			hasUserBookmarked: bookmarkedSet.has(post.id),
			attachments: attachmentsMap.get(post.id),
		}));

		const hasNextPage = items.length > config.POSTS_PAGINATION_LIMIT;
		const sliced = hasNextPage
			? items.slice(0, config.POSTS_PAGINATION_LIMIT)
			: items;

		return {
			items: sliced,
			nextCursor: hasNextPage ? sliced[sliced.length - 1].createdAt : null,
		};
	}
	// --- AI GENERATED END ---
}
