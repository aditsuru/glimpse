import * as z from "zod";
import { ATTACHMENT_TYPES } from "@/lib/constants";

export const AttachmentSchema = z.object({
	fileUrl: z.string(),
	fileType: z.enum(ATTACHMENT_TYPES, {
		error: "Please upload a valid image or video file.",
	}),
	fileKey: z.string(),
});

const BasePostSchema = z.object({
	id: z.nanoid(),
	userId: z.string(),
	body: z.string().optional(),
	hasAttachments: z.boolean(),
	createdAt: z.coerce.date(),
	attachments: z
		.array(
			AttachmentSchema.omit({
				fileKey: true,
			})
		)
		.optional(),
});

export const PostOutputSchema = BasePostSchema.extend({
	hasUserLiked: z.boolean(),
	hasUserBookmarked: z.boolean(),
	likes: z.number().nonnegative(),
	bookmarks: z.number().nonnegative(),
	comments: z.number().nonnegative(),
	views: z.number().nonnegative(),
	authorName: z.string(),
	authorUsername: z.string(),
	authorAvatarUrl: z.string().nullable(),
	authorIsVerified: z.boolean(),
});

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
};
