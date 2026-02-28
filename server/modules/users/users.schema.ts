import * as z from "zod";

export const usersSchema = {
	profile: {
		input: z.object({
			bio: z.string().max(160).optional(),
			image: z.string().url().optional(),
			name: z.string().min(2).optional(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	signIn: {
		input: z.object({
			email: z.string().email(),
			password: z.string().nonempty(),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	signUp: {
		input: z.object({
			name: z.string().min(3).max(32),
			username: z.string().min(6).max(32),
			email: z.string().email(),
			password: z.string().min(8),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	signOut: {
		output: z.object({
			success: z.boolean(),
		}),
	},
};
