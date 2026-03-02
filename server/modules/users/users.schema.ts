import * as z from "zod";

export const usersSchema = {
	updateProfile: {
		input: z.object({
			bio: z.string().max(160).optional(),
			image: z.string().url().optional(),
			name: z.string().min(2).optional(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},
	checkAvailability: {
		input: z.object({
			email: z.string().email(),
			username: z.string().min(6),
		}),
		output: z.object({
			emailTaken: z.boolean(),
			usernameTaken: z.boolean(),
		}),
	},
};
