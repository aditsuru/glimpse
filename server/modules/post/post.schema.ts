import * as z from "zod";
import {
	AttachmentSchema,
	BasePostSchema,
	PostOutputSchema,
} from "@/server/shared/schemas/post";

export const postSchema = {
	get: {
		input: z.object({
			postId: z.string(),
		}),
		output: PostOutputSchema,
	},
	create: {
		input: BasePostSchema.omit({
			id: true,
			createdAt: true,
			userId: true,
			attachments: true,
			hasAttachments: true,
		}).extend({
			attachments: z.array(AttachmentSchema).optional(),
		}),
		output: z.object({
			postId: z.nanoid(),
		}),
	},
	delete: {
		input: z.object({
			postId: z.nanoid(),
		}),
		output: z.object({
			postId: z.nanoid(),
		}),
	},
	markPostSeen: {
		input: z.object({
			postId: z.nanoid(),
		}),
		output: z.object({
			success: true,
		}),
	},
};
