import * as z from "zod";
import { VisibilityEnum } from "@/db/schema";
import { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";

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

	onboard: {
		input: z.object({
			username: z.string(),
			displayName: z.string(),
			avatarKey: z.string().optional(),
			avatarMimeType: z.enum(ALLOWED_MIME_TYPES.avatar).optional(),
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
			username: z.string().optional(),
			displayName: z.string().optional(),
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
			mimeType: z.enum(ALLOWED_MIME_TYPES.avatar),
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
};
