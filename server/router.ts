import { commentRouter } from "./modules/comment/comment.route";
import { postRouter } from "./modules/post/post.route";
import { uploadRouter } from "./modules/upload/upload.route";
import { base } from "./os";

export const router = base.router({
	upload: uploadRouter,
	post: postRouter,
	comment: commentRouter,
});

export type Router = typeof router;
