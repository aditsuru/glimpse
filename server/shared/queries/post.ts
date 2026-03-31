import {
	type AnyColumn,
	and,
	count,
	desc,
	eq,
	inArray,
	type SQL,
} from "drizzle-orm";
import type { AnyPgTable } from "drizzle-orm/pg-core";
import type { db as DBType } from "@/drizzle/db";
import {
	bookmarksTable,
	commentsTable,
	postLikesTable,
	postsTable,
	profilesTable,
	user,
} from "@/drizzle/schema";

export async function fetchUserLikedPostIds(
	db: typeof DBType,
	viewerId: string,
	postIds: string[]
): Promise<Set<string>> {
	if (postIds.length === 0) return new Set();
	const rows = await db
		.select({ postId: postLikesTable.postId })
		.from(postLikesTable)
		.where(
			and(
				eq(postLikesTable.userId, viewerId),
				inArray(postLikesTable.postId, postIds)
			)
		);
	return new Set(rows.map((r) => r.postId));
}

export async function fetchUserBookmarkedPostIds(
	db: typeof DBType,
	viewerId: string,
	postIds: string[]
): Promise<Set<string>> {
	if (postIds.length === 0) return new Set();
	const rows = await db
		.select({ postId: bookmarksTable.postId })
		.from(bookmarksTable)
		.where(
			and(
				eq(bookmarksTable.userId, viewerId),
				inArray(bookmarksTable.postId, postIds)
			)
		);
	return new Set(rows.map((r) => r.postId));
}

export async function getInteractionCount(
	db: typeof DBType,
	table: AnyPgTable,
	column: AnyColumn,
	id: string
): Promise<number> {
	const [{ count: c }] = await db
		.select({ count: count() })
		.from(table)
		.where(eq(column, id));
	return Number(c);
}

export async function fetchPostPage(
	db: typeof DBType,
	limit: number,
	where?: SQL,
	orderBy?: SQL
) {
	const posts = await db
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
		})
		.from(postsTable)
		.leftJoin(postLikesTable, eq(postLikesTable.postId, postsTable.id))
		.leftJoin(commentsTable, eq(commentsTable.postId, postsTable.id))
		.leftJoin(bookmarksTable, eq(bookmarksTable.postId, postsTable.id))
		.innerJoin(user, eq(user.id, postsTable.userId))
		.innerJoin(profilesTable, eq(profilesTable.userId, postsTable.userId))
		.where(where)
		.groupBy(postsTable.id)
		.orderBy(orderBy ?? desc(postsTable.createdAt))
		.limit(limit);

	return posts;
}
