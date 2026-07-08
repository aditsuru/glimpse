import * as z from "zod";

export const banSchema = {
	create: {
		input: z.object({
			userId: z.string(),
			reason: z.string().min(5, "Please provide a reason (min 5 characters)."),
			isPermanent: z.boolean().default(true),
			durationDays: z.number().int().positive().optional(),
		}),
		output: z.object({ success: z.boolean() }),
	},
};
