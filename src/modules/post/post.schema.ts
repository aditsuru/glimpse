import * as z from "zod";
import { postSelectSchema } from "@/db/schema";
import { ALLOWED_MIME_TYPES } from "@/lib/shared/constants";

export const AttachmentSchema = z.object({
	mimeType: z.enum(ALLOWED_MIME_TYPES.attachment),
	spoiler: z.boolean(),
	attachmentKey: z.string(),
});

const getPostOutput = postSelectSchema.extend({
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
};
