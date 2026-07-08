import * as z from "zod";

export const dmcaSchema = {
	create: {
		input: z.object({
			fullName: z.string().min(2, "Full legal name is required."),
			email: z.email("Valid email is required."),
			address: z.string().min(10, "A complete physical address is required."),
			phone: z.string().optional(),
			copyrightedWorkDescription: z
				.string()
				.min(20, "Please describe the copyrighted work in detail."),
			infringingUrl: z.url(
				"Please provide the exact URL of the infringing content."
			),
			additionalContext: z.string().optional(),
			goodFaithStatement: z.literal(true, {
				message: "This statement is required.",
			}),
			perjuryStatement: z.literal(true, {
				message: "This statement is required.",
			}),
			signature: z.string().min(2, "Electronic signature is required."),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
