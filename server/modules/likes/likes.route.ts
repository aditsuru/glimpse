import { protectedProcedure } from "@/server/os";
import { likesSchema } from "./likes.schema";
import { LikeService } from "./likes.service";

const likesProcedure = protectedProcedure.use(({ context, next }) => {
	const likeService = new LikeService(context.db);
	return next({
		context: {
			...context,
			likeService,
		},
	});
});

export const likesRouter = {
	post: {
		count: likesProcedure
			.input(likesSchema.getPostLikesCount.input)
			.output(likesSchema.getPostLikesCount.output)
			.handler(async ({ input, context }) => {
				return await context.likeService.getPostLikesCount({
					...input,
				});
			}),

		like: likesProcedure
			.input(likesSchema.likePost.input)
			.output(likesSchema.likePost.output)
			.handler(async ({ input, context }) => {
				const userId = context.session.user.id;
				return await context.likeService.likePost({
					...input,
					userId,
				});
			}),
		unlike: likesProcedure
			.input(likesSchema.unlikePost.input)
			.output(likesSchema.unlikePost.output)
			.handler(async ({ input, context }) => {
				const userId = context.session.user.id;
				return await context.likeService.unlikePost({
					...input,
					userId,
				});
			}),
	},
	comment: {
		count: likesProcedure
			.input(likesSchema.getCommentLikesCount.input)
			.output(likesSchema.getCommentLikesCount.output)
			.handler(async ({ input, context }) => {
				return await context.likeService.getCommentLikesCount({
					...input,
				});
			}),

		like: likesProcedure
			.input(likesSchema.likeComment.input)
			.output(likesSchema.likeComment.output)
			.handler(async ({ input, context }) => {
				const userId = context.session.user.id;
				return await context.likeService.likeComment({
					...input,
					userId,
				});
			}),
		unlike: likesProcedure
			.input(likesSchema.unlikeComment.input)
			.output(likesSchema.unlikeComment.output)
			.handler(async ({ input, context }) => {
				const userId = context.session.user.id;
				return await context.likeService.unlikeComment({
					...input,
					userId,
				});
			}),
	},
};
