import { authedProcedure, base } from "@/server/os";
import { postSchema } from "./post.schema";
import { PostService } from "./post.service";

const postProcedure = authedProcedure.use(({ context, next }) => {
	const postService = new PostService(context.db, context.session.user.id);
	return next({
		context: {
			postService,
		},
	});
});

export const postRouter = base.router({
	get: postProcedure
		.input(postSchema.get.input)
		.output(postSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.postService.get({
				...input,
			});
		}),
	create: postProcedure
		.input(postSchema.create.input)
		.output(postSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.postService.create({
				...input,
			});
		}),
	delete: postProcedure
		.input(postSchema.delete.input)
		.output(postSchema.delete.output)
		.handler(async ({ input, context }) => {
			return await context.postService.delete({
				...input,
			});
		}),
});
