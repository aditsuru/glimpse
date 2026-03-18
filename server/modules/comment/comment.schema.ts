import * as z from "zod";

const BaseCommentSchema = z.object({
	id: z.nanoid(),
	userId: z.string(),
	postId: z.string(),
	body: z.string().optional(),
	createdAt: z.coerce.date(),
});

export const commentSchema = {
	getByPost: {
		input: z.object({
			postId: z.nanoid(),
			nextCursor: z.date().optional(),
		}),
		output: z.array(
			BaseCommentSchema.extend({
				authorUsername: z.string(),
				authorAvatarUrl: z.string().nullable(),
				authorIsVerified: z.boolean(),
				hasUserLiked: z.boolean(),
				likes: z.number().nonnegative(),
			})
		),
	},
};
