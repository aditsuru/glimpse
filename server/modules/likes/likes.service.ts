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
		const [result] = await this.db
			.select({ count: count() })
			.from(postLikesTable)
			.where(eq(postLikesTable.postId, postId));

		return Number(result?.count ?? 0);
	}

	async getCommentLikesCount({
		commentId,
	}: z.infer<typeof likesSchema.getCommentLikesCount.input>): Promise<
		z.infer<typeof likesSchema.getCommentLikesCount.output>
	> {
		const [result] = await this.db
			.select({ count: count() })
			.from(commentLikesTable)
			.where(eq(commentLikesTable.commentId, commentId));

		return Number(result?.count ?? 0);
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
			if (e && typeof e === "object" && "code" in e) {
				if (e.code === "23503") {
					throw new ORPCError("NOT_FOUND", { message: "Post not found." });
				}
			}

			throw e;
		}
	}

	async unlikePost({
		postId,
		userId,
	}: z.infer<typeof likesSchema.unlikePost.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.unlikePost.output>> {
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
			if (e && typeof e === "object" && "code" in e) {
				if (e.code === "23503") {
					throw new ORPCError("NOT_FOUND", { message: "Comment not found." });
				}
			}

			throw e;
		}
	}

	async unlikeComment({
		commentId,
		userId,
	}: z.infer<typeof likesSchema.unlikeComment.input> & {
		userId: string;
	}): Promise<z.infer<typeof likesSchema.unlikeComment.output>> {
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
	}
}
