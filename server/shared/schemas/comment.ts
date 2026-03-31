import * as z from "zod";

export const BaseCommentSchema = z.object({
	id: z.nanoid(),
	userId: z.string(),
	postId: z.string(),
	body: z.string(),
	createdAt: z.coerce.date(),
});

export const OutputCommentSchema = BaseCommentSchema.extend({
	authorUsername: z.string(),
	authorAvatarUrl: z.string(),
	authorIsVerified: z.boolean(),
	hasUserLiked: z.boolean(),
	likes: z.number().nonnegative(),
});
