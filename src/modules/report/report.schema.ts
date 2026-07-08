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

export const reportSchema = {
	create: {
		input: z.object({
			targetType: z.enum(["post", "comment", "user"]),
			targetId: z.string(),
			reason: z.enum(REPORT_REASONS),
			body: z
				.string()
				.min(10, "Please provide at least 10 characters of context.")
				.max(1000),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
};
