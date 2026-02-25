import { protectedProcedure } from "@/server/os";
import { commentSchemas } from "./comments.schema";
import { CommentService } from "./comments.service";

const commentsProcedure = protectedProcedure.use(({ context, next }) => {
	const commentsService = new CommentService(context.db);
	return next({
		context: {
			...context,
			commentsService,
		},
	});
});

export const commentsRouter = {
	list: commentsProcedure
		.input(commentSchemas.listInput)
		.output(commentSchemas.listOutput)
		.handler(async ({ input, context }) => {
			return await context.commentsService.listComments({ ...input });
		}),
	create: commentsProcedure
		.input(commentSchemas.createInput)
		.output(commentSchemas.createOutput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			return await context.commentsService.createComment({ ...input, userId });
		}),
	delete: commentsProcedure
		.input(commentSchemas.deleteInput)
		.output(commentSchemas.deleteOutput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			return await context.commentsService.deleteComment({ ...input, userId });
		}),
};
