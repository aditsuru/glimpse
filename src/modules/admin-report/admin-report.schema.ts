import * as z from "zod";

const actorSchema = z.object({
	userId: z.string(),
	username: z.string(),
	displayName: z.string(),
	avatarUrl: z.string().nullable(),
});

export const adminReportSchema = {
	getReports: {
		input: z.object({
			status: z.enum(["pending", "resolved", "dismissed"]),
			cursor: z.date().nullable().default(null),
		}),
		output: z.object({
			items: z.array(
				z.object({
					id: z.string(),
					reporter: actorSchema,
					targetType: z.enum(["post", "comment", "user"]),
					targetPostId: z.string().nullable(),
					targetCommentId: z.string().nullable(),
					targetUser: actorSchema.nullable(),
					reason: z.string(),
					body: z.string().nullable(),
					status: z.enum(["pending", "resolved", "dismissed"]),
					createdAt: z.date(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},

	resolveReport: {
		input: z.object({
			reportId: z.string(),
			outcome: z.enum(["resolved", "dismissed"]),
		}),
		output: z.object({ success: z.boolean() }),
	},

	getDmcaRequests: {
		input: z.object({
			status: z.enum(["pending", "resolved", "dismissed"]),
			cursor: z.date().nullable().default(null),
		}),
		output: z.object({
			items: z.array(
				z.object({
					id: z.string(),
					fullName: z.string(),
					email: z.string(),
					address: z.string(),
					phone: z.string().nullable(),
					copyrightedWorkDescription: z.string(),
					infringingUrl: z.string(),
					additionalContext: z.string().nullable(),
					signature: z.string(),
					status: z.enum(["pending", "resolved", "dismissed"]),
					createdAt: z.date(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},

	resolveDmcaRequest: {
		input: z.object({
			requestId: z.string(),
			outcome: z.enum(["resolved", "dismissed"]),
		}),
		output: z.object({ success: z.boolean() }),
	},
};
