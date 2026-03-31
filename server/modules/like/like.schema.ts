import * as z from "zod";
import { PostOutputSchema } from "@/server/shared/schemas/post";

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
		add: {
			input: z.object({
				postId: z.string(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		remove: {
			input: z.object({
				postId: z.string(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
	},
	comment: {
		add: {
			input: z.object({
				commentId: z.string(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
		remove: {
			input: z.object({
				commentId: z.string(),
			}),
			output: z.object({
				count: z.number().nonnegative(),
			}),
		},
	},
};
