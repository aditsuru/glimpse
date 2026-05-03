import * as z from "zod";
import { profileSelectSchema, VisibilityEnum } from "@/db/schema";
import { viewerFollowStatusEnum } from "@/lib/server/helpers";
import { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";

const getProfileOutput = profileSelectSchema.extend({
	followersCount: z.number(),
	followingCount: z.number(),
	viewerStatus: z.enum(viewerFollowStatusEnum),
});

export const profileSchema = {
	get: {
		input: z.object({
			username: z.string().optional(),
			userId: z.string().optional(),
		}),
		output: getProfileOutput,
	},

	onboard: {
		input: z.object({
			username: z.string().min(1),
			displayName: z.string().min(1),
			avatarKey: z.string().optional(),
		}),
		output: z.object({
			success: z.boolean(),
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

	update: {
		input: z.object({
			username: z.string().min(1).optional(),
			displayName: z.string().min(1).optional(),
			pronouns: z.string().optional(),
			bio: z.string().optional(),
			visibility: z.enum(VisibilityEnum.enumValues).optional(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	getAvatarPresignedUrl: {
		input: z.object({
			mimeType: z.enum(ALLOWED_MIME_TYPES.avatar),
		}),
		output: z.object({
			presignedUrl: z.string(),
			key: z.string(),
		}),
	},

	getBannerPresignedUrl: {
		input: z.object({
			mimeType: z.enum(ALLOWED_MIME_TYPES.banner),
		}),
		output: z.object({
			presignedUrl: z.string(),
			key: z.string(),
		}),
	},

	updateAvatar: {
		input: z.object({
			key: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	updateBanner: {
		input: z.object({
			key: z.string(),
			mimeType: z.enum(ALLOWED_MIME_TYPES.banner),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	search: {
		input: z.object({
			query: z.string(),
			cursor: z.date().optional(),
		}),
		output: z.object({
			items: z.array(getProfileOutput),
			nextCursor: z.date().nullable(),
		}),
	},
};
