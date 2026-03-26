import * as z from "zod";

const BaseProfileSchema = z.object({
	profileId: z.string(),
	avatarUrl: z.url(),
	username: z.string(),
	name: z.string(),
	isGlimpseVerified: z.boolean(),
});

export const followSchema = {
	getFollowers: {
		input: z.object({
			nextCursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(BaseProfileSchema),
			nextCursor: z.date().nullable(),
		}),
	},
	getFollowings: {
		input: z.object({
			nextCursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(BaseProfileSchema),
			nextCursor: z.date().nullable(),
		}),
	},
	add: {
		input: z.object({
			followingId: z.string(),
		}),
		output: z.object({
			count: z.number().nonnegative(),
		}),
	},
	remove: {
		input: z.object({
			followingId: z.string(),
		}),
		output: z.object({
			count: z.number().nonnegative(),
		}),
	},
};
