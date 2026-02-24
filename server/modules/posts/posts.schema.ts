import * as z from "zod";
import type { NewPost, Post } from "@/drizzle/schema/posts-schema";

export const postSchemas = {
	// List
	listInput: z.object({
		page: z.number().positive().default(1),
		authorId: z.string().uuid().optional(),
	}),
	listOutput: z.object({
		data: z.array(z.custom<Post>()),
		meta: z.object({
			totalPosts: z.number().nonnegative(),
			totalPages: z.number().nonnegative(),
			currentPage: z.number().positive(),
			nextPage: z.number().positive().optional(),
			hasNextPage: z.boolean(),
			hasPreviousPage: z.boolean(),
		}),
	}),

	// Get
	getInput: z.object({
		postId: z.string().uuid(),
	}),
	getOutput: z.custom<Post>(),

	// Create
	createInput: z.custom<NewPost>(),
	createOutput: z.object({}),

	// Update
	updateInput: z.object({}),
	updateOutput: z.object({}),

	// Delete
	deleteInput: z.object({}),
	deleteOutput: z.object({}),
};
