import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, lt } from "drizzle-orm";
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
import { buildCommentPage } from "@/server/shared/queries/comment";
import type { commentSchema } from "./comment.schema";

export class CommentService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async getByPost({
		postId,
		nextCursor,
	}: z.infer<typeof commentSchema.getByPost.input>): Promise<
		z.infer<typeof commentSchema.getByPost.output>
	> {
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
					nextCursor ? lt(commentsTable.createdAt, nextCursor) : undefined
				)
			)
			.groupBy(commentsTable.id)
			.orderBy(desc(commentsTable.createdAt))
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		return buildCommentPage(
			this.db,
			comments,
			this.userId,
			config.COMMENTS_PAGINATION_LIMIT
		);
	}

	async getByComment({
		parentCommentId,
		nextCursor,
	}: z.infer<typeof commentSchema.getByComment.input>): Promise<
		z.infer<typeof commentSchema.getByComment.output>
	> {
		const comments = await this.db
			.select({
				id: commentsTable.id,
				body: commentsTable.body,
				parentCommentId: commentsTable.parentCommentId,
				userId: commentsTable.userId,
				postId: commentsTable.postId,
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
					eq(commentsTable.parentCommentId, parentCommentId),
					nextCursor ? lt(commentsTable.createdAt, nextCursor) : undefined
				)
			)
			.groupBy(commentsTable.id)
			.orderBy(desc(commentsTable.createdAt))
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		return buildCommentPage(
			this.db,
			comments,
			this.userId,
			config.COMMENTS_PAGINATION_LIMIT
		);
	}

	async getCommentsHistory({
		nextCursor,
	}: z.infer<typeof commentSchema.getCommentsHistory.input>): Promise<
		z.infer<typeof commentSchema.getCommentsHistory.output>
	> {
		const comments = await this.db
			.select({
				id: commentsTable.id,
				body: commentsTable.body,
				parentCommentId: commentsTable.parentCommentId,
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
					eq(commentsTable.userId, this.userId),
					nextCursor ? lt(commentsTable.createdAt, nextCursor) : undefined
				)
			)
			.groupBy(commentsTable.id)
			.orderBy(desc(commentsTable.createdAt))
			.limit(config.COMMENTS_PAGINATION_LIMIT + 1);

		return buildCommentPage(
			this.db,
			comments,
			this.userId,
			config.COMMENTS_PAGINATION_LIMIT
		);
	}

	async create({
		parentCommentId,
		postId,
		body,
	}: z.infer<typeof commentSchema.create.input>): Promise<
		z.infer<typeof commentSchema.create.output>
	> {
		if (parentCommentId) {
			const [parent] = await this.db
				.select()
				.from(commentsTable)
				.where(eq(commentsTable.id, parentCommentId))
				.limit(1);

			if (!parent)
				throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
			if (parent.parentCommentId)
				throw new ORPCError("BAD_REQUEST", {
					message: "More than one level of nesting is not allowed",
				});
		}

		const [comment] = await this.db
			.insert(commentsTable)
			.values({
				userId: this.userId,
				parentCommentId,
				postId,
				body,
			})
			.returning();

		return {
			commentId: comment.id,
		};
	}

	async delete({
		commentId,
	}: z.infer<typeof commentSchema.delete.input>): Promise<
		z.infer<typeof commentSchema.delete.output>
	> {
		const [comment] = await this.db
			.delete(commentsTable)
			.where(
				and(
					eq(commentsTable.id, commentId),
					eq(commentsTable.userId, this.userId)
				)
			)
			.returning();

		if (!comment)
			throw new ORPCError("NOT_FOUND", {
				message: "Comment not found or you don't have permission to delete it",
			});

		return {
			commentId: comment.id,
		};
	}
}
