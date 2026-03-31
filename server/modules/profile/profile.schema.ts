import * as z from "zod";

export const profileSchema = {
	get: {
		input: z.object({
			username: z.string(),
		}),
		output: z.object({
			avatarUrl: z.string(),
			bannerUrl: z.string(),
			username: z.string(),
			name: z.string(),
			bio: z.string().nullable(),
			website: z.string().nullable(),
			isGlimpseVerified: z.boolean(),
			followersCount: z.number(),
			followingsCount: z.number(),
			userId: z.string(),
			isFollowingUser: z.boolean(),
			isFollowedByUser: z.boolean(),
		}),
	},

	update: {
		input: z
			.object({
				bio: z.string(),
				website: z.string(),
				avatarUrl: z.string(),
				avatarKey: z.string(),
				bannerUrl: z.string(),
				bannerKey: z.string(),
				name: z.string(),
				username: z.string(),
			})
			.partial(),

		output: z.object({
			success: z.boolean(),
		}),
	},

	searchUsers: {
		input: z.object({
			query: z.string(),
			nextCursor: z.string().optional(),
		}),
		output: z.object({
			items: z.array(
				z.object({
					username: z.string(),
					name: z.string(),
					avatarUrl: z.string(),
					isGlimpseVerified: z.boolean(),
					isFollowingUser: z.boolean(),
					isFollowedByUser: z.boolean(),
				})
			),
			nextCursor: z.string().nullable(),
		}),
	},

	checkUsername: {
		input: z.object({
			username: z.string(),
		}),
		output: z.object({
			isAvailable: z.boolean(),
		}),
	},
};
