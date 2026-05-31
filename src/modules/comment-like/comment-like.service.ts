import { ORPCError } from "@orpc/server";
import { and, count, eq, sql } from "drizzle-orm";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { commentLikesTable } from "@/db/schema/comment-likes";
import type { commentLikeSchema } from "@/modules/comment-like/comment-like.schema";

export class CommentLikeService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async get({
		commentId,
	}: z.infer<typeof commentLikeSchema.get.input>): Promise<
		z.infer<typeof commentLikeSchema.get.output>
	> {
		const data = await this.db
			.select({
				count: count(),
				isLikedByUser: sql<boolean>`
					COALESCE(bool_or(${commentLikesTable.userId} = ${this.userId}), false)
				`,
			})
			.from(commentLikesTable)
			.where(eq(commentLikesTable.commentId, commentId))
			.then((i) => i[0]);

		return data;
	}

	async add({
		commentId,
	}: z.infer<typeof commentLikeSchema.add.input>): Promise<
		z.infer<typeof commentLikeSchema.add.output>
	> {
		try {
			await this.db
				.insert(commentLikesTable)
				.values({
					userId: this.userId,
					commentId,
				})
				.onConflictDoNothing();

			return {
				success: true,
			};
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23503") {
				throw new ORPCError("NOT_FOUND", { message: "Comment not found." });
			}
			throw error;
		}
	}

	async remove({
		commentId,
	}: z.infer<typeof commentLikeSchema.remove.input>): Promise<
		z.infer<typeof commentLikeSchema.remove.output>
	> {
		await this.db
			.delete(commentLikesTable)
			.where(
				and(
					eq(commentLikesTable.commentId, commentId),
					eq(commentLikesTable.userId, this.userId)
				)
			);

		return {
			success: true,
		};
	}
}
