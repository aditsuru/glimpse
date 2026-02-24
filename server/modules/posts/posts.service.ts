import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
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
		this.db;
		authorId;
		page;
		return {};
	}

	async getPost({
		postId,
	}: z.infer<typeof postSchemas.getInput>): Promise<
		z.infer<typeof postSchemas.getOutput>
	> {
		// Implementation
		postId;
		return {};
	}

	async createPost({
		authorId,
	}: z.infer<typeof postSchemas.createInput>): Promise<
		z.infer<typeof postSchemas.createOutput>
	> {
		// Implementation
		authorId;
		return {};
	}

	async updatePost(
		arg: z.infer<typeof postSchemas.updateInput>
	): Promise<z.infer<typeof postSchemas.updateOutput>> {
		// Implementation
		arg;
		return {};
	}

	async deletePost(
		arg: z.infer<typeof postSchemas.deleteInput>
	): Promise<z.infer<typeof postSchemas.deleteOutput>> {
		// Implementation
		arg;
		return {};
	}
}
