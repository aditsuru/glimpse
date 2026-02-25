import * as z from "zod";

const commentSchema = z.object({
	id: z.string().uuid(),
	body: z.string().nonempty(),
	authorId: z.string().uuid(),
	postId: z.string().uuid(),
	parentCommentId: z.string().uuid().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

const createCommentSchema = z.object({
	body: z.string().nonempty(),
	postId: z.string().uuid(),
	parentCommentId: z.string().uuid().nullable(),
});

export const commentSchemas = {
	// List
	listInput: z.object({
		postId: z.string().uuid(),
		parentCommentId: z.string().uuid().nullable(),
		page: z.number().positive().default(1),
	}),
	listOutput: z.object({
		data: z.array(commentSchema),
		meta: z.object({
			totalComments: z.number().nonnegative(),
			totalPages: z.number().nonnegative(),
			currentPage: z.number().positive(),
			nextPage: z.number().positive().optional(),
			hasNextPage: z.boolean(),
			hasPreviousPage: z.boolean(),
		}),
	}),

	// Create
	createInput: createCommentSchema,
	createOutput: commentSchema,

	// Delete
	deleteInput: z.object({
		id: z.string().uuid(),
	}),
	deleteOutput: commentSchema,
};
