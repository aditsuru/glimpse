import * as z from "zod";

export const SignInSchema = z.object({
	email: z.email("Email must be valid"),
	password: z
		.string({ error: "Password is required" })
		.nonempty("Password is required"),
});

export const SignUpSchema = z
	.object({
		email: z.email("Email must be valid"),
		password: z
			.string({ error: "Password is required" })
			.min(8, "Password must be 8 characters long")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number"),
		confirmPassword: z
			.string({ error: "Confirm password is required" })
			.min(1, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;
export type SignInSchemaType = z.infer<typeof SignInSchema>;
