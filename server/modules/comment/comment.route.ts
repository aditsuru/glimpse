import { authedProcedure, base } from "@/server/os";
import { commentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";

const commentProcedure = authedProcedure.use(({ context, next }) => {
	const commentService = new CommentService(context.db);
	return next({
		context: {
			commentService,
		},
	});
});

export const commentRouter = base.router({
	getByPost: commentProcedure
		.input(commentSchema.getByPost.input)
		.output(commentSchema.getByPost.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getByPost({
				...input,
				viewerId: context.session.user.id,
			});
		}),
	getByComment: commentProcedure
		.input(commentSchema.getByComment.input)
		.output(commentSchema.getByComment.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getByComment({
				...input,
				viewerId: context.session.user.id,
			});
		}),
	getCommentsHistory: commentProcedure
		.input(commentSchema.getCommentsHistory.input)
		.output(commentSchema.getCommentsHistory.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getCommentsHistory({
				...input,
				viewerId: context.session.user.id,
			});
		}),
	create: commentProcedure
		.input(commentSchema.create.input)
		.output(commentSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.create({
				...input,
				userId: context.session.user.id,
			});
		}),
	delete: commentProcedure
		.input(commentSchema.delete.input)
		.output(commentSchema.delete.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.delete({
				...input,
				userId: context.session.user.id,
			});
		}),
});
