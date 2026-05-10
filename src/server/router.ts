import { bookmarkRouter } from "@/modules/bookmark/bookmark.route";
import { commentRouter } from "@/modules/comment/comment.route";
import { followRouter } from "@/modules/follow/follow.route";
import { postRouter } from "@/modules/post/post.route";
import { postLikeRouter } from "@/modules/post-like/post-like.route";
import { profileRouter } from "@/modules/profile/profile.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
	follow: followRouter,
	post: postRouter,
	postLike: postLikeRouter,
	bookmark: bookmarkRouter,
	comment: commentRouter,
});

export type Router = typeof router;
