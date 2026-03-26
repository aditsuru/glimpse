import { commentRouter } from "./modules/comment/comment.route";
import { likeRouter } from "./modules/like/like.route";
import { postRouter } from "./modules/post/post.route";
import { uploadRouter } from "./modules/upload/upload.route";
import { base } from "./os";

export const router = base.router({
	upload: uploadRouter,
	post: postRouter,
	comment: commentRouter,
	like: likeRouter,
});

export type Router = typeof router;
