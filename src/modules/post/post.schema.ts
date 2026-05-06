import * as z from "zod";
import { postSelectSchema } from "@/db/schema";
import { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";

export const AttachmentSchema = z.object({
	mimeType: z.enum(ALLOWED_MIME_TYPES.attachment),
	attachmentKey: z.string(),
});

const postAuthorSchema = z.object({
	id: z.string(),
	username: z.string(),
	displayName: z.string(),
	isGlimpseVerified: z.boolean(),
	avatarUrl: z.string().nullable(),
});

const getPostOutput = postSelectSchema.extend({
	author: postAuthorSchema,
	attachments: z.array(
		AttachmentSchema.omit({
			attachmentKey: true,
		}).extend({
			url: z.string(),
		})
	),
});

const getPostListOutput = z.object({
	items: z.array(getPostOutput),
	nextCursor: z.date().nullable(),
});

export const postSchema = {
	markPostSeen: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	getAttachmentPresignedUrl: {
		input: z.object({
			mimeType: z.enum(ALLOWED_MIME_TYPES.attachment),
		}),
		output: z.object({
			presignedUrl: z.string(),
			key: z.string(),
		}),
	},

	create: {
		input: z.object({
			body: z.string().optional(),
			attachments: z.array(AttachmentSchema).optional(),
			spoiler: z.boolean(),
		}),
		output: z.object({
			postId: z.string(),
		}),
	},

	delete: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	get: {
		input: z.object({
			postId: z.string(),
		}),
		output: getPostOutput,
	},

	getAllByUser: {
		input: z.object({
			username: z.string(),
			cursor: z.date().optional(),
		}),
		output: getPostListOutput,
	},

	getFeed: {
		input: z.object({
			cursor: z.date().optional(),
		}),
		output: getPostListOutput,
	},
};
