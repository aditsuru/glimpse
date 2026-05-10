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
	getCount: commentProcedure
		.input(commentSchema.getCount.input)
		.output(commentSchema.getCount.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getCount({ ...input });
		}),

	create: commentProcedure
		.input(commentSchema.create.input)
		.output(commentSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.create({ ...input });
		}),

	delete: commentProcedure
		.input(commentSchema.delete.input)
		.output(commentSchema.delete.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.delete({ ...input });
		}),

	getPostComments: commentProcedure
		.input(commentSchema.getPostComments.input)
		.output(commentSchema.getPostComments.output)
		.handler(async ({ input, context }) => {
			return await context.commentService.getPostComments({ ...input });
		}),
});
