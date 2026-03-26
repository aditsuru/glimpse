import { authedProcedure, base } from "@/server/os";
import { bookmarkSchema } from "./bookmark.schema";
import { BookmarkService } from "./bookmark.service";

const bookmarkProcedure = authedProcedure.use(({ context, next }) => {
	const bookmarkService = new BookmarkService(context.db);
	return next({
		context: {
			bookmarkService,
		},
	});
});

export const bookmarkRouter = base.router({
	profile: base.router({
		getBookmarksHistory: bookmarkProcedure
			.input(bookmarkSchema.profile.getBookmarksHistory.input)
			.output(bookmarkSchema.profile.getBookmarksHistory.output)
			.handler(async ({ input, context }) => {
				return await context.bookmarkService.getBookmarksHistory({
					...input,
					viewerId: context.session.user.id,
				});
			}),
	}),
});
