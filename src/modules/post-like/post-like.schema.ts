import * as z from "zod";
import { getPostListOutput } from "../post/post.schema";

export const postLikeSchema = {
	get: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			count: z.number(),
			isLikedByUser: z.boolean(),
		}),
	},

	getLikedPosts: {
		input: z.object({
			cursor: z.date().optional(),
		}),
		output: getPostListOutput,
	},

	add: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	remove: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
