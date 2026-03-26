import * as z from "zod";

export const likeSchema = {
	post: {
		getLikes: {
			input: z.object({
				postId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		add: {
			input: z.object({
				postId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		remove: {
			input: z.object({
				postId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
	},
	comment: {
		getLikes: {
			input: z.object({
				commentId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		add: {
			input: z.object({
				commentId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		remove: {
			input: z.object({
				commentId: z.nanoid(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
	},
};
