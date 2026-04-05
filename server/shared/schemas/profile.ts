import * as z from "zod";

export const BaseProfileSchema = z.object({
	profileId: z.string(),
	avatarUrl: z.string(),
	username: z.string(),
	name: z.string(),
	isGlimpseVerified: z.boolean(),
	isFollowingUser: z.boolean(),
	isFollowedByUser: z.boolean(),
});

export const OutputProfileSchema = z.object({
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
});

export type BaseProfile = z.infer<typeof BaseProfileSchema>;
export type OutputProfile = z.infer<typeof OutputProfileSchema>;
