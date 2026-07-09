import * as z from "zod";

export const dmcaSchema = {
	create: {
		input: z.object({
			fullName: z.string().min(2),
			email: z.email(),
			address: z.string().min(10),
			phone: z.string().optional(),
			copyrightedWorkDescription: z.string().min(20),
			infringingUrl: z.url(),
			additionalContext: z.string().optional(),
			goodFaithStatement: z.literal(true, {
				message: "This statement is required.",
			}),
			perjuryStatement: z.literal(true, {
				message: "This statement is required.",
			}),
			signature: z.string().min(2),
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
					fullName: z.string(),
					email: z.string(),
					address: z.string(),
					phone: z.string().nullable(),
					copyrightedWorkDescription: z.string(),
					infringingUrl: z.string(),
					additionalContext: z.string().nullable(),
					signature: z.string(),
					status: z.enum(["pending", "resolved", "dismissed"]),
					adminNotes: z.string().nullable(),
					createdAt: z.date(),
				})
			),
			nextCursor: z.date().nullable(),
		}),
	},

	resolve: {
		input: z.object({
			dmcaId: z.string(),
			action: z.enum(["dismiss", "resolve"]),
			adminNotes: z.string().optional(),
		}),
		output: z.object({ success: z.boolean() }),
	},
};
