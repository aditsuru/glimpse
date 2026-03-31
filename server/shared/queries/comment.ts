import { and, eq, inArray } from "drizzle-orm";
import type { db as DBType } from "@/drizzle/db";
import { commentLikesTable } from "@/drizzle/schema";
import { paginateResult } from "../helpers/paginate";

export async function buildCommentPage<
	C extends {
		id: string;
		createdAt: Date;
	},
>(db: typeof DBType, comments: C[], viewerId: string, limit: number) {
	let hasUserLikedMap = new Set();
	if (comments.length > 0) {
		const commentsLikedByUserWithinLimit = await db
			.select({
				commentId: commentLikesTable.commentId,
			})
			.from(commentLikesTable)
			.where(
				and(
					eq(commentLikesTable.userId, viewerId),
					inArray(
						commentLikesTable.commentId,
						comments.map((c) => c.id)
					)
				)
			);

		hasUserLikedMap = new Set(
			commentsLikedByUserWithinLimit.map((c) => c.commentId)
		);
	}

	const commentsMap = comments.map((c) => ({
		...c,
		hasUserLiked: hasUserLikedMap.has(c.id),
	}));

	return paginateResult(commentsMap, limit, (item) => item.createdAt);
}
