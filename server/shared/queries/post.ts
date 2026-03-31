import { type AnyColumn, and, count, eq, inArray } from "drizzle-orm";
import type { AnyPgTable } from "drizzle-orm/pg-core";
import type { db as DBType } from "@/drizzle/db";
import { bookmarksTable, postLikesTable } from "@/drizzle/schema";

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
