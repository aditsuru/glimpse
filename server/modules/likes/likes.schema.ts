import * as z from "zod";

export const likesSchema = {
	getPostLikesCount: {
		input: z.object({
			postId: z.string().uuid(),
		}),
		output: z.number().nonnegative(),
	},
	getCommentLikesCount: {
		input: z.object({
			commentId: z.string().uuid(),
		}),
		output: z.number().nonnegative(),
	},

	likePost: {
		input: z.object({
			postId: z.string().uuid(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	unlikePost: {
		input: z.object({
			postId: z.string().uuid(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	likeComment: {
		input: z.object({
			commentId: z.string().uuid(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	unlikeComment: {
		input: z.object({
			commentId: z.string().uuid(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
