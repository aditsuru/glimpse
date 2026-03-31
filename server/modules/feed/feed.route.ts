import { authedProcedure, base } from "@/server/os";
import { feedSchema } from "./feed.schema";
import { FeedService } from "./feed.service";

const feedProcedure = authedProcedure.use(({ context, next }) => {
	const feedService = new FeedService(context.db);
	return next({
		context: {
			feedService,
		},
	});
});

export const feedRouter = base.router({
	get: feedProcedure
		.input(feedSchema.get.input)
		.output(feedSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.feedService.get({
				...input,
				userId: context.session.user.id,
			});
		}),
});
