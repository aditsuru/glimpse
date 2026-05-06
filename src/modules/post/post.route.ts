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
	markPostSeen: postProcedure
		.input(postSchema.markPostSeen.input)
		.output(postSchema.markPostSeen.output)
		.handler(async ({ input, context }) => {
			return await context.postService.markPostSeen({ ...input });
		}),

	getAttachmentPresignedUrl: postProcedure
		.input(postSchema.getAttachmentPresignedUrl.input)
		.output(postSchema.getAttachmentPresignedUrl.output)
		.handler(async ({ input, context }) => {
			return await context.postService.getAttachmentPresignedUrl({ ...input });
		}),

	create: postProcedure
		.input(postSchema.create.input)
		.output(postSchema.create.output)
		.handler(async ({ input, context }) => {
			return await context.postService.create({ ...input });
		}),

	delete: postProcedure
		.input(postSchema.delete.input)
		.output(postSchema.delete.output)
		.handler(async ({ input, context }) => {
			return await context.postService.delete({ ...input });
		}),

	get: postProcedure
		.input(postSchema.get.input)
		.output(postSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.postService.get({ ...input });
		}),

	getAllByUser: postProcedure
		.input(postSchema.getAllByUser.input)
		.output(postSchema.getAllByUser.output)
		.handler(async ({ input, context }) => {
			return await context.postService.getAllByUser({ ...input });
		}),

	getFeed: postProcedure
		.input(postSchema.getFeed.input)
		.output(postSchema.getFeed.output)
		.handler(async ({ input, context }) => {
			return await context.postService.getFeed({ ...input });
		}),
});
