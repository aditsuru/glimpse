import { ORPCError } from "@orpc/client";
import { and, count, eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { postsTable } from "@/drizzle/schema/posts-schema";
import type { postSchemas } from "./posts.schema";

export class PostService {
	constructor(private db: typeof DBType) {}

	async listPosts({
		authorId,
		page,
	}: z.infer<typeof postSchemas.listInput>): Promise<
		z.infer<typeof postSchemas.listOutput>
	> {
		// Implementation
		try {
			const [postsList, totalPosts] = await Promise.all([
				this.db
					.select({
						id: postsTable.id,
						title: postsTable.title,
						body: postsTable.body,
						mimeType: postsTable.mimeType,
						fileUrl: postsTable.fileUrl,
						authorId: postsTable.authorId,
						createdAt: postsTable.createdAt,
						updatedAt: postsTable.updatedAt,
					})
					.from(postsTable)
					.where(authorId ? eq(postsTable.authorId, authorId) : undefined)
					.offset((page - 1) * 10)
					.limit(10)
					.orderBy(postsTable.createdAt),
				Number(
					(
						await this.db
							.select({
								count: count(),
							})
							.from(postsTable)
							.where(authorId ? eq(postsTable.authorId, authorId) : undefined)
					)[0].count
				),
			]);

			const totalPages = Math.ceil(totalPosts / 10);
			const response = {
				data: postsList,
				meta: {
					totalPosts,
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

	async getPost({
		postId,
	}: z.infer<typeof postSchemas.getInput>): Promise<
		z.infer<typeof postSchemas.getOutput>
	> {
		// Implementation
		try {
			const post = await this.db
				.select()
				.from(postsTable)
				.where(eq(postsTable.id, postId));
			if (post.length === 0)
				throw new ORPCError("NOT_FOUND", {
					message: "Requested post doesn't exists.",
				});
			return post[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to get post.",
				cause: e,
			});
		}
	}

	async createPost(
		post: z.infer<typeof postSchemas.createInput> & {
			authorId: string;
		}
	): Promise<z.infer<typeof postSchemas.createOutput>> {
		// Implementation
		try {
			const newPost = await this.db.insert(postsTable).values(post).returning();
			return newPost[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to create post.",
				cause: e,
			});
		}
	}

	async updatePost({
		id,
		authorId,
		...newPost
	}: z.infer<typeof postSchemas.updateInput> & {
		authorId: string;
	}): Promise<z.infer<typeof postSchemas.updateOutput>> {
		// Implementation
		try {
			const updatedPost = await this.db
				.update(postsTable)
				.set(newPost)
				.where(and(eq(postsTable.id, id), eq(postsTable.authorId, authorId)))
				.returning();
			if (updatedPost.length === 0) {
				throw new ORPCError("NOT_FOUND", {
					message:
						"Requested post doesn't exist or you do not have permission to modify it.",
				});
			}
			return updatedPost[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to update post.",
				cause: e,
			});
		}
	}

	async deletePost({
		id,
		authorId,
	}: z.infer<typeof postSchemas.deleteInput> & {
		authorId: string;
	}): Promise<z.infer<typeof postSchemas.deleteOutput>> {
		// Implementation
		try {
			const deletedPost = await this.db
				.delete(postsTable)
				.where(and(eq(postsTable.id, id), eq(postsTable.authorId, authorId)))
				.returning();
			if (deletedPost.length === 0) {
				throw new ORPCError("NOT_FOUND", {
					message:
						"Requested post doesn't exist or you do not have permission to modify it.",
				});
			}
			return deletedPost[0];
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to delete post.",
				cause: e,
			});
		}
	}
}
