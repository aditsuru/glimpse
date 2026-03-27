import { bookmarkRouter } from "./modules/bookmark/bookmark.route";
import { commentRouter } from "./modules/comment/comment.route";
import { likeRouter } from "./modules/like/like.route";
import { postRouter } from "./modules/post/post.route";
import { profileRouter } from "./modules/profile/profile.route";
import { uploadRouter } from "./modules/upload/upload.route";
import { base } from "./os";

export const router = base.router({
	upload: uploadRouter,
	post: postRouter,
	comment: commentRouter,
	like: likeRouter,
	bookmark: bookmarkRouter,
	profile: profileRouter,
});

export type Router = typeof router;
