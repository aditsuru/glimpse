import * as z from "zod";

export const accountSchema = {
	getSecuritySettings: {
		output: z.object({
			email: z.string(),
			hasPassword: z.boolean(),
			oauthProviders: z.array(z.string()),
		}),
	},

	setPassword: {
		input: z.object({
			newPassword: z.string().min(8, "Password must be at least 8 characters"),
		}),
		output: z.object({
			success: z.boolean(),
		}),
	},

	verifyPassword: {
		input: z.object({
			password: z.string().min(1, "Password is required"),
		}),
		output: z.object({
			valid: z.boolean(),
		}),
	},
};
