import * as z from "zod";
import {
	BaseCommentSchema,
	OutputCommentSchema,
} from "@/server/shared/schemas/comment";

export const commentSchema = {
	getByPost: {
		input: z.object({
			postId: z.nanoid(),
			nextCursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(OutputCommentSchema),
			nextCursor: z.date().nullable(),
		}),
	},
	getByComment: {
		input: z.object({
			parentCommentId: z.nanoid(),
			nextCursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(
				OutputCommentSchema.extend({
					parentCommentId: z.nanoid().nullable(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},
	getCommentsHistory: {
		input: z.object({
			nextCursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(
				OutputCommentSchema.extend({
					parentCommentId: z.nanoid().nullable(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},
	create: {
		input: BaseCommentSchema.omit({
			id: true,
			createdAt: true,
			userId: true,
		}).extend({
			parentCommentId: z.nanoid().optional(),
		}),
		output: z.object({
			commentId: z.nanoid(),
		}),
	},
	delete: {
		input: z.object({ commentId: z.string() }),
		output: z.object({
			commentId: z.nanoid(),
		}),
	},
};
