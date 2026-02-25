import * as z from "zod";

const postSchema = z.object({
	id: z.string().uuid(),
	title: z.string().max(256),
	body: z.string().nullable().optional(),
	mimeType: z.string().max(50).nullable().optional(),
	fileUrl: z.string().nullable().optional(),
	authorId: z.string().uuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const createBodySchema = z.object({
	title: z.string().max(256),
	body: z.string().optional(),
	mimeType: z.string().max(50).optional(),
	fileUrl: z.string().optional(),
});

export const postSchemas = {
	// List
	listInput: z.object({
		page: z.number().positive().default(1),
		authorId: z.string().uuid().optional(),
	}),
	listOutput: z.object({
		data: z.array(postSchema),
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
	getOutput: postSchema,

	// Create
	createInput: createBodySchema,
	createOutput: postSchema,

	// Update
	updateInput: createBodySchema.partial().extend({
		id: z.string().uuid(),
	}),
	updateOutput: postSchema,

	// Delete
	deleteInput: z.object({
		id: z.string().uuid(),
	}),
	deleteOutput: postSchema,
};
