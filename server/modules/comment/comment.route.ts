import { authedProcedure, base } from "@/server/os";
import { commentSchema } from "./comment.schema";
import { CommentService } from "./comment.service";

const commentProcedure = authedProcedure.use(({ context, next }) => {
	const commentService = new CommentService(
		context.db,
		context.session.user.id
	);
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
			});
		}),
	getByComment: commentProcedure
		.input(commentSchema.getByComment.input)
		.output(commentSchema.getByComment.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getByComment({
				...input,
			});
		}),
	getCommentsHistory: commentProcedure
		.input(commentSchema.getCommentsHistory.input)
		.output(commentSchema.getCommentsHistory.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getCommentsHistory({
				...input,
			});
		}),
	create: commentProcedure
		.input(commentSchema.create.input)
		.output(commentSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.create({
				...input,
			});
		}),
	delete: commentProcedure
		.input(commentSchema.delete.input)
		.output(commentSchema.delete.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.delete({
				...input,
			});
		}),
});
