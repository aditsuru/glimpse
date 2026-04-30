import * as z from "zod";
import { VisibilityEnum } from "@/db/schema";

export const profileSchema = {
	get: {
		input: z.object({ username: z.string() }),
		output: z.object({
			userId: z.string(),
			username: z.string(),
			displayName: z.string(),
			pronouns: z.string().nullable(),
			isGlimpseVerified: z.boolean(),
			bio: z.string().nullable(),
			visibility: z.enum(VisibilityEnum.enumValues),
			avatarUrl: z.string().nullable(),
			avatarMimeType: z.string().nullable(),
			bannerUrl: z.string().nullable(),
			bannerMimeType: z.string().nullable(),
			createdAt: z.date(),
			updatedAt: z.date(),
		}),
	},

	isUsernameAvailable: {
		input: z.object({
			username: z.string(),
		}),
		output: z.object({
			available: z.boolean(),
		}),
	},
};
