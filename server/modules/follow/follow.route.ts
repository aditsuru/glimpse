import { authedProcedure, base } from "@/server/os";
import { followSchema } from "./follow.schema";
import { FollowService } from "./follow.service";

const followProcedure = authedProcedure.use(({ context, next }) => {
	const followService = new FollowService(context.db);
	return next({
		context: {
			followService,
		},
	});
});

export const followRouter = base.router({
	getFollowers: followProcedure
		.input(followSchema.getFollowers.input)
		.output(followSchema.getFollowers.output)
		.handler(async ({ input, context }) => {
			return await context.followService.getFollowers({
				...input,
				userId: context.session.user.id,
			});
		}),
	getFollowings: followProcedure
		.input(followSchema.getFollowings.input)
		.output(followSchema.getFollowings.output)
		.handler(async ({ input, context }) => {
			return await context.followService.getFollowings({
				...input,
				userId: context.session.user.id,
			});
		}),

	add: followProcedure
		.input(followSchema.add.input)
		.output(followSchema.add.output)
		.handler(async ({ input, context }) => {
			return await context.followService.add({
				...input,
				userId: context.session.user.id,
			});
		}),

	remove: followProcedure
		.input(followSchema.remove.input)
		.output(followSchema.remove.output)
		.handler(async ({ input, context }) => {
			return await context.followService.remove({
				...input,
				userId: context.session.user.id,
			});
		}),
});
