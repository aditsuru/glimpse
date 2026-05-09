import { authedProcedure, base } from "@/server/os";
import { postLikeSchema } from "./post-like.schema";
import { PostLikeService } from "./post-like.service";

const postLikeProcedure = authedProcedure.use(({ context, next }) => {
	const postLikeService = new PostLikeService(
		context.db,
		context.session.user.id
	);
	return next({
		context: {
			postLikeService,
		},
	});
});

export const postLikeRouter = base.router({
	get: postLikeProcedure
		.input(postLikeSchema.get.input)
		.output(postLikeSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.postLikeService.get({ ...input });
		}),

	getLikedPosts: postLikeProcedure
		.input(postLikeSchema.getLikedPosts.input)
		.output(postLikeSchema.getLikedPosts.output)
		.handler(async ({ input, context }) => {
			return await context.postLikeService.getLikedPosts({ ...input });
		}),

	add: postLikeProcedure
		.input(postLikeSchema.add.input)
		.output(postLikeSchema.add.output)
		.handler(async ({ input, context }) => {
			return await context.postLikeService.add({ ...input });
		}),

	remove: postLikeProcedure
		.input(postLikeSchema.remove.input)
		.output(postLikeSchema.remove.output)
		.handler(async ({ input, context }) => {
			return await context.postLikeService.remove({ ...input });
		}),
});
