import { protectedProcedure } from "@/server/os";
import { postSchemas } from "./posts.schema";
import { PostService } from "./posts.service";

const postsProcedure = protectedProcedure.use(({ context, next }) => {
	const postsService = new PostService(context.db);
	return next({
		context: {
			...context,
			postsService,
		},
	});
});

export const postsRouter = {
	list: postsProcedure
		.input(postSchemas.listInput)
		.output(postSchemas.listOutput)
		.handler(async ({ input, context }) => {
			return await context.postsService.listPosts({ ...input });
		}),
	get: postsProcedure
		.input(postSchemas.getInput)
		.output(postSchemas.getOutput)
		.handler(async ({ input, context }) => {
			return await context.postsService.getPost({ ...input });
		}),
	create: postsProcedure
		.input(postSchemas.createInput)
		.output(postSchemas.createOutput)
		.handler(async ({ input, context }) => {
			const authorId = context.session.user.id;
			return await context.postsService.createPost({
				...input,
				authorId,
			});
		}),
	update: postsProcedure
		.input(postSchemas.updateInput)
		.output(postSchemas.updateOutput)
		.handler(async ({ input, context }) => {
			const authorId = context.session.user.id;
			return await context.postsService.updatePost({ ...input, authorId });
		}),
	delete: postsProcedure
		.input(postSchemas.deleteInput)
		.output(postSchemas.deleteOutput)
		.handler(async ({ input, context }) => {
			const authorId = context.session.user.id;
			return await context.postsService.deletePost({ ...input, authorId });
		}),
};
