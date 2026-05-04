import { authedProcedure, base } from "@/server/os";
import { PostService } from "./post.service";

const postProcedure = authedProcedure.use(({ context, next }) => {
	const postService = new PostService(context.db, context.session.user.id);
	return next({
		context: {
			postService,
		},
	});
});
export const postRouter = base.router({});
