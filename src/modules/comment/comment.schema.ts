import * as z from "zod";
import { commentSelectSchema } from "@/db/schema/comments";

const commentAuthorSchema = z.object({
	id: z.string(),
	username: z.string(),
	displayName: z.string(),
	isGlimpseVerified: z.boolean(),
	avatarUrl: z.string().nullable(),
});

export const getCommentOutput = commentSelectSchema.extend({
	author: commentAuthorSchema,
});

export const getCommentListOutput = z.object({
	items: z.array(getCommentOutput),
	nextCursor: z.date().nullable(),
});

export const commentSchema = {
	getCount: {
		input: z.object({
			postId: z.string(),
		}),

		output: z.object({
			count: z.number(),
		}),
	},

	getPostComments: {
		input: z.object({
			postId: z.string(),
			cursor: z.date().optional(),
			highlight: z.string().optional(),
		}),

		output: getCommentListOutput,
	},

	getAllCommentsByUser: {
		input: z.object({
			username: z.string(),
			cursor: z.date().optional(),
		}),

		output: getCommentListOutput,
	},

	create: {
		input: z.object({
			postId: z.string(),
			body: z.string(),
		}),

		output: z.object({
			success: z.boolean(),
		}),
	},

	delete: {
		input: z.object({
			commentId: z.string(),
		}),

		output: z.object({
			success: z.boolean(),
		}),
	},

	getCommentReplies: {
		input: z.object({
			commentId: z.string(),
			cursor: z.date().optional(),
		}),

		output: getCommentListOutput,
	},
};
