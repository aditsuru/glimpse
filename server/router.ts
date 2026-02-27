import { commentsRouter } from "./modules/comments/comments.route";
import { likesRouter } from "./modules/likes/likes.route";
import { postsRouter } from "./modules/posts/posts.route";

export const router = {
	posts: postsRouter,
	comments: commentsRouter,
	likes: likesRouter,
};

export type Router = typeof router;
