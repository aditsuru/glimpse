import * as z from "zod";

const BaseCommentSchema = z.object({
	id: z.nanoid(),
	userId: z.string(),
	postId: z.string(),
	body: z.string(),
	createdAt: z.coerce.date(),
});

const OutputCommentSchema = BaseCommentSchema.extend({
	authorUsername: z.string(),
	authorAvatarUrl: z.string(),
	authorIsVerified: z.boolean(),
	hasUserLiked: z.boolean(),
	likes: z.number().nonnegative(),
});

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
