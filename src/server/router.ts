import { followRouter } from "@/modules/follow/follow.route";
import { postRouter } from "@/modules/post/post.route";
import { postLikeRouter } from "@/modules/postLike/post-like.route";
import { profileRouter } from "@/modules/profile/profile.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
	follow: followRouter,
	post: postRouter,
	postLike: postLikeRouter,
});

export type Router = typeof router;
