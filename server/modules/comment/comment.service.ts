import { ORPCError } from "@orpc/server";
import { and, count, eq, gt, inArray } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import {
	commentLikesTable,
	commentsTable,
	postsTable,
	profilesTable,
	user,
} from "@/drizzle/schema";
import { config } from "@/lib/config";
import type { commentSchema } from "./comment.schema";

export class CommentService {
	constructor(private db: typeof DBType) {}

	async getByPost({
		postId,
		nextCursor,
		viewerId,
	}: z.infer<typeof commentSchema.getByPost.input> & {
		viewerId: string;
	}): Promise<z.infer<typeof commentSchema.getByPost.output>> {
		const [post] = await this.db
			.select()
			.from(postsTable)
			.where(eq(postsTable.id, postId))
			.limit(1);

		if (!post) throw new ORPCError("NOT_FOUND", { message: "Post not found" });

		const comments = await this.db
			.select({
				id: commentsTable.id,
				body: commentsTable.body,
				postId: commentsTable.postId,
				userId: commentsTable.userId,
				createdAt: commentsTable.createdAt,
				likes: count(commentLikesTable.userId).as("likes"),
				authorAvatarUrl: profilesTable.avatarUrl,
				authorName: user.name,
				authorUsername: user.username,
				authorIsVerified: profilesTable.isGlimpseVerified,
			})
			.from(commentsTable)
			.leftJoin(
				commentLikesTable,
				eq(commentLikesTable.commentId, commentsTable.id)
			)
			.innerJoin(user, eq(user.id, commentsTable.userId))
			.innerJoin(profilesTable, eq(profilesTable.userId, commentsTable.userId))
			.where(
				and(
					eq(commentsTable.postId, postId),
					nextCursor ? gt(commentsTable.createdAt, nextCursor) : undefined
				)
			)
			.groupBy(commentsTable.id)
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		let hasUserLikedMap = new Set();
		if (comments.length > 0) {
			const commentsLikedByUserWithinLimit = await this.db
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

		const hasNextPage = commentsMap.length > config.COMMENTS_PAGINATION_LIMIT;

		const items = hasNextPage
			? commentsMap.slice(0, config.COMMENTS_PAGINATION_LIMIT)
			: commentsMap;

		return {
			items,
			nextCursor: hasNextPage ? items[items.length - 1].createdAt : null,
		};
	}
}
