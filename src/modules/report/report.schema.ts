import * as z from "zod";

export const REPORT_REASONS = [
	"spam",
	"nsfw",
	"harassment",
	"hate_speech",
	"self_harm",
	"misinformation",
	"copyright",
	"other",
] as const;

const actorSchema = z.object({
	userId: z.string(),
	username: z.string(),
	displayName: z.string(),
	avatarUrl: z.string().nullable(),
});

export const reportSchema = {
	create: {
		input: z.object({
			targetType: z.enum(["post", "comment", "user"]),
			targetId: z.string(),
			reason: z.enum(REPORT_REASONS),
			body: z.string().min(10).max(1000),
		}),
		output: z.object({ success: z.boolean() }),
	},

	getAll: {
		input: z.object({
			status: z.enum(["pending", "resolved", "dismissed"]),
			cursor: z.date().nullable().default(null),
		}),
		output: z.object({
			items: z.array(
				z.object({
					id: z.string(),
					targetType: z.enum(["post", "comment", "user"]),
					reason: z.enum(REPORT_REASONS),
					body: z.string().nullable(),
					status: z.enum(["pending", "resolved", "dismissed"]),
					adminNotes: z.string().nullable(),
					createdAt: z.date(),
					reporter: actorSchema,
					targetPostId: z.string().nullable(),
					targetCommentId: z.string().nullable(),
					targetUserId: z.string().nullable(),
					offender: actorSchema.nullable(),
					postPreview: z
						.object({ id: z.string(), body: z.string().nullable() })
						.nullable(),
					commentPreview: z
						.object({ id: z.string(), body: z.string(), postId: z.string() })
						.nullable(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},

	resolve: {
		input: z.object({
			reportId: z.string(),
			action: z.enum(["dismiss", "resolve"]),
			adminNotes: z.string().optional(),
		}),
		output: z.object({ success: z.boolean() }),
	},

	deleteContent: {
		input: z.object({
			reportId: z.string(),
		}),
		output: z.object({ success: z.boolean() }),
	},
};
