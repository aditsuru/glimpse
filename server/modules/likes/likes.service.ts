import { ORPCError } from "@orpc/server";
import { and, count, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { commentLikesTable, postLikesTable } from "@/drizzle/schema";
import type { likesSchema } from "./likes.schema";

export class LikeService {
	constructor(private db: typeof DBType) {}

	async getPostLikesCount({
		postId,
	}: z.infer<typeof likesSchema.getPostLikesCount.input>): Promise<
		z.infer<typeof likesSchema.getPostLikesCount.output>
	> {
		try {
			const [result] = await this.db
				.select({ count: count() })
				.from(postLikesTable)
				.where(eq(postLikesTable.postId, postId));

			return Number(result?.count ?? 0);
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get post likes count.",
				cause: e,
			});
		}
	}

	async getCommentLikesCount({
		commentId,
	}: z.infer<typeof likesSchema.getCommentLikesCount.input>): Promise<
		z.infer<typeof likesSchema.getCommentLikesCount.output>
	> {
		try {
			const [result] = await this.db
				.select({ count: count() })
				.from(commentLikesTable)
				.where(eq(commentLikesTable.commentId, commentId));

			return Number(result?.count ?? 0);
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get comment likes count.",
				cause: e,
			});
		}
	}

	async likePost({
		postId,
		userId,
	}: z.infer<typeof likesSchema.likePost.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.likePost.output>> {
		try {
			await this.db
				.insert(postLikesTable)
				.values({ postId, userId })
				.onConflictDoNothing();

			return {
				success: true,
			};
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			if (e && typeof e === "object" && "code" in e) {
				if (e.code === "23503") {
					throw new ORPCError("NOT_FOUND", { message: "Post not found." });
				}
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to like the post.",
				cause: e,
			});
		}
	}

	async unlikePost({
		postId,
		userId,
	}: z.infer<typeof likesSchema.unlikePost.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.unlikePost.output>> {
		try {
			await this.db
				.delete(postLikesTable)
				.where(
					and(
						eq(postLikesTable.postId, postId),
						eq(postLikesTable.userId, userId)
					)
				);

			return {
				success: true,
			};
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to unlike the post.",
				cause: e,
			});
		}
	}

	async likeComment({
		commentId,
		userId,
	}: z.infer<typeof likesSchema.likeComment.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.likeComment.output>> {
		try {
			await this.db
				.insert(commentLikesTable)
				.values({ commentId, userId })
				.onConflictDoNothing();

			return {
				success: true,
			};
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			if (e && typeof e === "object" && "code" in e) {
				if (e.code === "23503") {
					throw new ORPCError("NOT_FOUND", { message: "Comment not found." });
				}
			}

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to like the comment.",
				cause: e,
			});
		}
	}

	async unlikeComment({
		commentId,
		userId,
	}: z.infer<typeof likesSchema.unlikeComment.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.unlikeComment.output>> {
		try {
			await this.db
				.delete(commentLikesTable)
				.where(
					and(
						eq(commentLikesTable.commentId, commentId),
						eq(commentLikesTable.userId, userId)
					)
				);

			return {
				success: true,
			};
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to unlike the comment.",
				cause: e,
			});
		}
	}
}
