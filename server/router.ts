import { postsRouter } from "./modules/posts/posts.route";

export const router = {
	posts: postsRouter,
};

export type Router = typeof router;
