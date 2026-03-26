import { and, count, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { commentLikesTable, postLikesTable } from "@/drizzle/schema";
import type { likeSchema } from "./like.schema";

export class LikePostService {
	constructor(private db: typeof DBType) {}

	async getLikes({
		postId,
	}: z.infer<typeof likeSchema.post.getLikes.input>): Promise<
		z.infer<typeof likeSchema.post.getLikes.output>
	> {
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

	async getLikes({
		commentId,
	}: z.infer<typeof likeSchema.comment.getLikes.input>): Promise<
		z.infer<typeof likeSchema.comment.getLikes.output>
	> {
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
