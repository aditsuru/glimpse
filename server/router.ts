import { commentsRouter } from "./modules/comments/comments.route";
import { likesRouter } from "./modules/likes/likes.route";
import { postsRouter } from "./modules/posts/posts.route";
import { usersRouter } from "./modules/users/users.route";
import { baseOs } from "./os";

export const router = baseOs.router({
	posts: postsRouter,
	comments: commentsRouter,
	likes: likesRouter,
	users: usersRouter,
});

export type Router = typeof router;
