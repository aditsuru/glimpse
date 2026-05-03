import * as z from "zod";
import { profileSelectSchema } from "@/db/schema";
import { viewerFollowStatusEnum } from "@/lib/server/helpers";

const followListOutput = z.object({
	items: z.array(profileSelectSchema),
	nextCursor: z.date().nullable(),
});

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

	getStatus: {
		input: z.object({
			targetUserId: z.string(),
		}),
		output: z.object({
			status: z.enum(viewerFollowStatusEnum),
		}),
	},

	getFollowers: {
		input: z.object({
			userId: z.string(),
			cursor: z.date().optional(),
		}),
		output: followListOutput,
	},

	getFollowing: {
		input: z.object({
			userId: z.string(),
			cursor: z.date().optional(),
		}),
		output: followListOutput,
	},

	getPendingReceived: {
		input: z.object({
			cursor: z.date().optional(),
		}),
		output: followListOutput,
	},

	getPendingSent: {
		input: z.object({
			cursor: z.date().optional(),
		}),
		output: followListOutput,
	},
};
