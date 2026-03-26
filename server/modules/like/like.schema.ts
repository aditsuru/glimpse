import * as z from "zod";
import { PostOutputSchema } from "../post/post.schema";

export const likeSchema = {
	profile: {
		getLikesHistory: {
			input: z.object({
				nextCursor: z.date().optional(),
			}),
			output: z.object({
				items: z.array(PostOutputSchema),
				nextCursor: z.date().nullable(),
			}),
		},
	},
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
