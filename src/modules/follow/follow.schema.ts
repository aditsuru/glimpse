import * as z from "zod";

export const followSchema = {
	send: {
		input: z.object({
			targetUserId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	remove: {
		input: z.object({
			targetUserId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	accept: {
		input: z.object({
			followerId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	reject: {
		input: z.object({
			followerId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	removeFollower: {
		input: z.object({
			followerId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
