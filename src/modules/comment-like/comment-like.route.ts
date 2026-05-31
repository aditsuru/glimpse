import { commentLikeSchema } from "@/modules/comment-like/comment-like.schema";
import { authedProcedure, base } from "@/server/os";
import { CommentLikeService } from "./comment-like.service";

const commentLikeProcedure = authedProcedure.use(({ context, next }) => {
	const commentLikeService = new CommentLikeService(
		context.db,
		context.session.user.id
	);
	return next({
		context: {
			commentLikeService,
		},
	});
});

export const commentLikeRouter = base.router({
	get: commentLikeProcedure
		.input(commentLikeSchema.get.input)
		.output(commentLikeSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.commentLikeService.get({ ...input });
		}),

	add: commentLikeProcedure
		.input(commentLikeSchema.add.input)
		.output(commentLikeSchema.add.output)
		.handler(async ({ input, context }) => {
			return await context.commentLikeService.add({ ...input });
		}),

	remove: commentLikeProcedure
		.input(commentLikeSchema.remove.input)
		.output(commentLikeSchema.remove.output)
		.handler(async ({ input, context }) => {
			return await context.commentLikeService.remove({ ...input });
		}),
});
