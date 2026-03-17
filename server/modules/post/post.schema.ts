import * as z from "zod";
import { ATTACHMENT_TYPES } from "@/lib/constants";

export const AttachmentSchema = z.object({
	fileUrl: z.url(),
	fileType: z.enum(ATTACHMENT_TYPES, {
		error: "Please upload a valid image or video file.",
	}),
});

export const postSchema = {
	get: {
		input: z.object({
			postId: z.string(),
		}),
		output: z.object({
			id: z.nanoid(),
			userId: z.string(),
			body: z.string().optional(),
			hasAttachments: z.boolean(),
			views: z.number().nonnegative(),
			likes: z.number().nonnegative(),
			bookmarks: z.number().nonnegative(),
			comments: z.number().nonnegative(),
			createdAt: z.coerce.date(),
			attachments: z.array(AttachmentSchema).optional(),
			hasUserLiked: z.boolean(),
			hasUserBookmarked: z.boolean(),
		}),
	},
};
