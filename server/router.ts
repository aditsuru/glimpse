import { commentsRouter } from "./modules/comments/comments.route";
import { postsRouter } from "./modules/posts/posts.route";

export const router = {
	posts: postsRouter,
	comments: commentsRouter,
};

export type Router = typeof router;
