import * as z from "zod";
import { getPostListOutput } from "../post/post.schema";

export const bookmarkSchema = {
	get: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			count: z.number(),
			isBookmarkedByUser: z.boolean(),
		}),
	},

	getBookmarkedPosts: {
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
