import * as z from "zod";

export const loginSchema = z.object({
	username: z
		.string()
		.nonempty("Username is required")
		.min(6, "Enter a valid username length"),
	password: z.string().nonempty("Password is required"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
