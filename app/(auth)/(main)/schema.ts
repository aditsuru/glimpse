import * as z from "zod";

export const SignInSchema = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.min(1, "Email is required")
		.email("Email must be valid"),
	password: z
		.string({ required_error: "Password is required" })
		.nonempty("Password is required"),
});

export const signupSchema = z
	.object({
		name: z
			.string({ required_error: "Name is required" })
			.min(1, "Name is required")
			.min(3, "Name is too short")
			.max(32, "Name is too long")
			.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
		username: z
			.string({ required_error: "Username is required" })
			.min(1, "Username is required")
			.min(6, "Username is too short")
			.max(32, "Username is too long")
			.regex(/^[a-zA-Z]/, "Username must start with a letter")
			.regex(
				/^[a-zA-Z0-9_.]+$/,
				"Username can only contain letters, numbers, underscores, and periods"
			),
		email: z
			.string({ required_error: "Email is required" })
			.min(1, "Email is required")
			.email("Email must be valid"),
		password: z
			.string({ required_error: "Password is required" })
			.min(8, "Password must be 8 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z
			.string({ required_error: "Confirm password is required" })
			.min(1, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type SignupSchemaType = z.infer<typeof signupSchema>;
export type SignInSchemaType = z.infer<typeof SignInSchema>;
