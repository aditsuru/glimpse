import { authedProcedure, base } from "@/server/os";
import { likeSchema } from "./like.schema";
import { LikeCommentService, LikePostService } from "./like.service";

// Posts
const likePostProcedure = authedProcedure.use(({ context, next }) => {
	const likePostService = new LikePostService(context.db);
	return next({
		context: {
			likePostService,
		},
	});
});

const likePostRouter = base.router({
	getLikes: likePostProcedure
		.input(likeSchema.post.getLikes.input)
		.output(likeSchema.post.getLikes.output)
		.handler(async ({ input, context }) => {
			return await context.likePostService.getLikes({
				...input,
			});
		}),
	add: likePostProcedure
		.input(likeSchema.post.add.input)
		.output(likeSchema.post.add.output)
		.handler(async ({ input, context }) => {
			return await context.likePostService.add({
				...input,
				userId: context.session.user.id,
			});
		}),
	remove: likePostProcedure
		.input(likeSchema.post.remove.input)
		.output(likeSchema.post.remove.output)
		.handler(async ({ input, context }) => {
			return await context.likePostService.remove({
				...input,
				userId: context.session.user.id,
			});
		}),
});

// Comments
const likeCommentProcedure = authedProcedure.use(({ context, next }) => {
	const likeCommentService = new LikeCommentService(context.db);
	return next({
		context: {
			likeCommentService,
		},
	});
});

const likeCommentRouter = base.router({
	getLikes: likeCommentProcedure
		.input(likeSchema.comment.getLikes.input)
		.output(likeSchema.comment.getLikes.output)
		.handler(async ({ input, context }) => {
			return await context.likeCommentService.getLikes({
				...input,
			});
		}),
	add: likeCommentProcedure
		.input(likeSchema.comment.add.input)
		.output(likeSchema.comment.add.output)
		.handler(async ({ input, context }) => {
			return await context.likeCommentService.add({
				...input,
				userId: context.session.user.id,
			});
		}),
	remove: likeCommentProcedure
		.input(likeSchema.comment.remove.input)
		.output(likeSchema.comment.remove.output)
		.handler(async ({ input, context }) => {
			return await context.likeCommentService.remove({
				...input,
				userId: context.session.user.id,
			});
		}),
});

export const likeRouter = base.router({
	post: likePostRouter,
	comment: likeCommentRouter,
});
