import { authedProcedure, base } from "@/server/os";
import { bookmarkSchema } from "./bookmark.schema";
import { BookmarkService } from "./bookmark.service";

const bookmarkProcedure = authedProcedure.use(({ context, next }) => {
	const bookmarkService = new BookmarkService(
		context.db,
		context.session.user.id
	);
	return next({
		context: {
			bookmarkService,
		},
	});
});

export const bookmarkRouter = base.router({
	get: bookmarkProcedure
		.input(bookmarkSchema.get.input)
		.output(bookmarkSchema.get.output)
		.handler(async ({ input, context }) => {
			return await context.bookmarkService.get({ ...input });
		}),

	getBookmarkedPosts: bookmarkProcedure
		.input(bookmarkSchema.getBookmarkedPosts.input)
		.output(bookmarkSchema.getBookmarkedPosts.output)
		.handler(async ({ input, context }) => {
			return await context.bookmarkService.getBookmarkedPosts({ ...input });
		}),

	add: bookmarkProcedure
		.input(bookmarkSchema.add.input)
		.output(bookmarkSchema.add.output)
		.handler(async ({ input, context }) => {
			return await context.bookmarkService.add({ ...input });
		}),

	remove: bookmarkProcedure
		.input(bookmarkSchema.remove.input)
		.output(bookmarkSchema.remove.output)
		.handler(async ({ input, context }) => {
			return await context.bookmarkService.remove({ ...input });
		}),
});
