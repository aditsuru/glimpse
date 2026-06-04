import * as z from "zod";

const actorSchema = z.object({
	userId: z.string(),
	username: z.string(),
	displayName: z.string(),
	isGlimpseVerified: z.boolean(),
	avatarUrl: z.string().nullable(),
});

const postPreviewSchema = z.object({
	id: z.string(),
	body: z.string().nullable(),
	attachment: z
		.object({
			mimeType: z.string(),
			url: z.string(),
		})
		.nullable(),
});

const baseNotification = z.object({
	id: z.string(),
	read: z.boolean(),
	actorCount: z.number(),
	actors: z.array(actorSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const notificationSchema = {
	getAll: {
		input: z.object({
			cursor: z.date().nullable().default(null),
		}),
		output: z.object({
			items: z.array(
				z.discriminatedUnion("type", [
					baseNotification.extend({
						type: z.literal("like"),
						postId: z.string(),
						post: postPreviewSchema,
					}),
					baseNotification.extend({
						type: z.literal("comment"),
						postId: z.string(),
						commentId: z.string().nullable(),
						post: postPreviewSchema,
						body: z.string().nullable(),
					}),
					baseNotification.extend({
						type: z.literal("comment_like"),
						postId: z.string(),
						commentId: z.string().nullable(),
						parentCommentId: z.string().nullable(),
					}),
					baseNotification.extend({
						type: z.literal("follow"),
					}),
					baseNotification.extend({
						type: z.literal("follow_accept"),
					}),
					baseNotification.extend({
						type: z.literal("system"),
						body: z.string(),
					}),
					baseNotification.extend({
						type: z.literal("reply"),
						postId: z.string(),
						commentId: z.string().nullable(),
						parentCommentId: z.string().nullable(),
						post: postPreviewSchema,
						body: z.string().nullable(),
					}),
				])
			),
			nextCursor: z.date().nullable(),
		}),
	},

	markSeen: {
		input: z.object({
			notificationId: z.string(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	getUnreadCount: {
		output: z.object({
			count: z.number(),
		}),
	},
};
