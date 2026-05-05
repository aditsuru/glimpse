import { followRouter } from "@/modules/follow/follow.route";
import { postRouter } from "@/modules/post/post.route";
import { profileRouter } from "@/modules/profile/profile.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
	follow: followRouter,
	post: postRouter,
});

export type Router = typeof router;
