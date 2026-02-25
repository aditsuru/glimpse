import { ORPCError } from "@orpc/client";
import { and, count, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { commentsTable } from "@/drizzle/schema";
import type { commentSchemas } from "./comments.schema";

export class CommentService {
	constructor(private db: typeof DBType) {}

	// List
	async listComments({
		postId,
		parentCommentId,
		page,
	}: z.infer<typeof commentSchemas.listInput>): Promise<
		z.infer<typeof commentSchemas.listOutput>
	> {
		try {
			const [commentsList, totalComments] = await Promise.all([
				this.db
					.select()
					.from(commentsTable)
					.where(
						and(
							eq(commentsTable.postId, postId),
							parentCommentId
								? eq(commentsTable.parentCommentId, parentCommentId)
								: undefined
						)
					),
				Number(
					(
						await this.db
							.select({ count: count() })
							.from(commentsTable)
							.where(
								and(
									eq(commentsTable.postId, postId),
									parentCommentId
										? eq(commentsTable.parentCommentId, parentCommentId)
										: undefined
								)
							)
					)[0].count
				),
			]);

			const totalPages = Math.ceil(totalComments / 10);
			const response = {
				data: commentsList,
				meta: {
					totalComments,
					totalPages,
					currentPage: page,
					nextPage: totalPages === page ? undefined : page + 1,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
			};

			return response;
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to get posts.",
				cause: e,
			});
		}
	}

	// Create
	async createComment({
		body,
		postId,
		userId,
		parentCommentId,
	}: z.infer<typeof commentSchemas.createInput> & {
		userId: string;
	}): Promise<z.infer<typeof commentSchemas.createOutput>> {
		try {
			if (parentCommentId) {
				const parentComment = await this.db
					.select()
					.from(commentsTable)
					.where(eq(commentsTable.id, parentCommentId));
				if (parentComment[0].parentCommentId !== null)
					throw new ORPCError("NOT_ACCEPTABLE", {
						message: "More than one level of nesting is not allowed.",
					});
			}

			const createdComment = await this.db
				.insert(commentsTable)
				.values({
					body,
					postId,
					parentCommentId: parentCommentId ?? null,
					authorId: userId,
				})
				.returning();

			return createdComment[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to get posts.",
				cause: e,
			});
		}
	}

	// Delete
	async deleteComment({
		id,
		userId,
	}: z.infer<typeof commentSchemas.deleteInput> & {
		userId: string;
	}): Promise<z.infer<typeof commentSchemas.deleteOutput>> {
		try {
			const deletedComment = await this.db
				.delete(commentsTable)
				.where(
					and(eq(commentsTable.authorId, userId), eq(commentsTable.id, id))
				)
				.returning();

			if (deletedComment.length === 0) {
				throw new ORPCError("NOT_FOUND", {
					message:
						"Requested post doesn't exist or you do not have permission to modify it.",
				});
			}
			return deletedComment[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to get posts.",
				cause: e,
			});
		}
	}
}
