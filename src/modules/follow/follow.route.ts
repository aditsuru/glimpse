import { authedProcedure, base } from "@/server/os";
import { followSchema } from "./follow.schema";
import { FollowService } from "./follow.service";

const followProcedure = authedProcedure.use(({ context, next }) => {
	const followService = new FollowService(context.db, context.session.user.id);
	return next({
		context: {
			followService,
		},
	});
});
export const followRouter = base.router({
	send: followProcedure
		.input(followSchema.send.input)
		.output(followSchema.send.output)
		.handler(async ({ input, context }) => {
			return await context.followService.send({ ...input });
		}),

	remove: followProcedure
		.input(followSchema.remove.input)
		.output(followSchema.remove.output)
		.handler(async ({ input, context }) => {
			return await context.followService.remove({ ...input });
		}),

	accept: followProcedure
		.input(followSchema.accept.input)
		.output(followSchema.accept.output)
		.handler(async ({ input, context }) => {
			return await context.followService.accept({ ...input });
		}),

	reject: followProcedure
		.input(followSchema.reject.input)
		.output(followSchema.reject.output)
		.handler(async ({ input, context }) => {
			return await context.followService.reject({ ...input });
		}),

	removeFollower: followProcedure
		.input(followSchema.removeFollower.input)
		.output(followSchema.removeFollower.output)
		.handler(async ({ input, context }) => {
			return await context.followService.removeFollower({ ...input });
		}),
});
