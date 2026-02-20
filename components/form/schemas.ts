import * as z from "zod";

export const loginSchema = z.object({
	username: z
		.string({ required_error: "Username is required" })
		.nonempty("Username is required")
		.min(6, "Enter a valid username length"),
	password: z
		.string({ required_error: "Password is required" })
		.nonempty("Password is required"),
});

export const signupSchema = z
	.object({
		name: z
			.string({ required_error: "Name is required" })
			.min(2, "Name is too short")
			.max(32, "Name is too long"),
		username: z
			.string({ required_error: "Username is required" })
			.min(6, "Username is too short")
			.max(32, "Username is too long"),
		password: z
			.string({ required_error: "Password is required" })
			.min(8, "Password must be 8 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z
			.string({ required_error: "Confirm password is required" })
			.nonempty("Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type SignupSchemaType = z.infer<typeof signupSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
