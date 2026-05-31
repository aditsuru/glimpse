import * as z from "zod";

export const commentLikeSchema = {
	get: {
		input: z.object({
			commentId: z.string(),
		}),
		output: z.object({
			count: z.number(),
			isLikedByUser: z.boolean(),
		}),
	},

	add: {
		input: z.object({
			commentId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	remove: {
		input: z.object({
			commentId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
