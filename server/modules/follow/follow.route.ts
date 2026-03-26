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
	get: followProcedure
		.input(followSchema.get.input)
		.output(followSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.followService.get({
				...input,
				userId: context.session.user.id,
			});
		}),
});