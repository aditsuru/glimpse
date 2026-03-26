import { authedProcedure, base } from "@/server/os";
import { likeSchema } from "./like.schema";
import {
	LikeCommentService,
	LikePostService,
	LikeProfileService,
} from "./like.service";

// Profile
const likeProfileProcedure = authedProcedure.use(({ context, next }) => {
	const likeProfileService = new LikeProfileService(context.db);
	return next({
		context: {
			likeProfileService,
		},
	});
});

const likeProfileRouter = base.router({
	getLikesHistory: likeProfileProcedure
		.input(likeSchema.profile.getLikesHistory.input)
		.output(likeSchema.profile.getLikesHistory.output)
		.handler(async ({ input, context }) => {
			return await context.likeProfileService.getLikesHistory({
				...input,
				viewerId: context.session.user.id,
			});
		}),
});

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
	profile: likeProfileRouter,
});
