import { followRouter } from "@/modules/follow/follow.route";
import { profileRouter } from "@/modules/profile/profile.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
	follow: followRouter,
});

export type Router = typeof router;
