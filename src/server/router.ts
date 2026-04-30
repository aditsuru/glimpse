import { profileRouter } from "@/modules/profile/profile.route";
import { base } from "./os";

export const router = base.router({
	profile: profileRouter,
});

export type Router = typeof router;
