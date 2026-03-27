import * as z from "zod";

export const profileSchema = {
	update: {
		input: z
			.object({
				bio: z.string(),
				website: z.string(),
				avatarUrl: z.url(),
				avatarKey: z.string(),
				bannerUrl: z.url(),
				bannerKey: z.string(),
				name: z.string(),
				username: z.string(),
			})
			.partial(),

		output: z.object({
			success: z.boolean(),
		}),
	},
};
