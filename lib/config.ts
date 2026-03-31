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

		// Redis
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),

		REDIS_FEED_SEEN_MAX_ITEMS: z.coerce.number().default(500),

		// Rate Limiting
		RATE_LIMIT_MAX: z.coerce.number().default(60),
		RATE_LIMIT_WINDOW: z
			.string()
			.transform((val) => ms(val as StringValue) / 1000)
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(10),
		AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),
		AUTH_RATE_LIMIT_WINDOW: z
			.string()
			.transform((val) => ms(val as StringValue) / 1000)
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(10),

		// Better auth config
		COOKIE_CACHE_AGE: z
			.string()
			.transform((val) => ms(val as StringValue) / 1000)
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(300), // Input ms lib value; Output seconds

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
