import * as z from "zod";

export const uploadSchema = {
	getPresignedUrl: {
		input: z.object({
			fileType: z.string(),
		}),
		output: z.object({
			presignedUrl: z.url(),
			fileUrl: z.url(),
			fileKey: z.string(),
		}),
	},
};
