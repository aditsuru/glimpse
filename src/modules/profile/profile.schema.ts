import * as z from "zod";

export const profileSchema = {
	get: {
		output: z.object({
			userId: z.string(),
			username: z.string(),
			displayName: z.string(),
			pronouns: z.string().nullable(),
			isGlimpseVerified: z.boolean(),
			bio: z.string().nullable(),
			avatarUrl: z.string().nullable(),
			avatarMimeType: z.string().nullable(),
			bannerUrl: z.string().nullable(),
			bannerMimeType: z.string().nullable(),
			createdAt: z.date(),
			updatedAt: z.date(),
		}),
	},
};
