import * as z from "zod";
import { ATTACHMENT_TYPES } from "@/lib/constants";

const AttachmentSchema = z.object({
	fileUrl: z.string(),
	fileType: z.enum(ATTACHMENT_TYPES),
});

const PostSchema = z.object({
	id: z.nanoid(),
	authorId: z.string(),
	body: z.string().optional(),
	hasAttachments: z.boolean(),
	createdAt: z.coerce.date(),
	attachments: z.array(AttachmentSchema).optional(),
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

const NextCursor = z.object({
	source: z.enum(["db", "redis"]),
	cursor: z.date(),
});

export const feedSchema = {
	get: {
		input: z.object({
			nextCursor: NextCursor,
		}),
		output: z.object({
			items: z.array(PostSchema),
			nextCursor: NextCursor,
		}),
	},
};
