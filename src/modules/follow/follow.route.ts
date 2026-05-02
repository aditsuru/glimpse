import { authedProcedure, base } from "@/server/os";
import { FollowService } from "./follow.service";

const followProcedure = authedProcedure.use(({ context, next }) => {
	const followService = new FollowService(context.db, context.session.user.id);
	return next({
		context: {
			followService,
		},
	});
});
export const followRouter = base.router({});
