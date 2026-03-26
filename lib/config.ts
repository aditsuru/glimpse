import { createEnv } from "@t3-oss/env-nextjs";
import ms, { type StringValue } from "ms";
import { z } from "zod";

export const config = createEnv({
	server: {
		// General
		NODE_ENV: z
			.enum(["production", "development", "testing", "staging"])
			.default("development"),

		// Database
		DATABASE_URL: z.url(),

		// Better auth config
		COOKIE_CACHE_AGE: z
			.string()
			.transform((val) => ms(val as StringValue) / 1000)
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(300000), // Input ms value; Output seconds

		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),

		// Business

		// Pagination
		COMMENTS_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
		POSTS_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
		PROFILE_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
	},
	client: {},
	experimental__runtimeEnv: {},
});
