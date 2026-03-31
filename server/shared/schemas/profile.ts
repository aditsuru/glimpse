import * as z from "zod";

export const BaseProfileSchema = z.object({
	profileId: z.string(),
	avatarUrl: z.string(),
	username: z.string(),
	name: z.string(),
	isGlimpseVerified: z.boolean(),
});
