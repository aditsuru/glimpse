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
			.transform((val) => ms(val as StringValue) / 1000) // Converts ms to s
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(300000),
	},
	client: {
		// General
		NEXT_PUBLIC_APP_URL: z.url(),
		NEXT_PUBLIC_VERIFICATION_EMAIL_RESEND_TIMEOUT: z
			.string()
			.transform((val) => ms(val as StringValue)) // Converts "2h" to 7200000
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(60),

		// React Query
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_STALE_TIME: z
			.string()
			.transform((val) => ms(val as StringValue))
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(300000),
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_GC_TIME: z
			.string()
			.transform((val) => ms(val as StringValue))
			.refine((val) => !Number.isNaN(val), { message: "Invalid time format" })
			.default(300000),
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_MAX_RETRY_COUNT: z.coerce
			.number()
			.nonnegative()
			.default(1),
	},
	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_STALE_TIME:
			process.env.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_STALE_TIME,
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_GC_TIME:
			process.env.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_GC_TIME,
		NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_MAX_RETRY_COUNT:
			process.env.NEXT_PUBLIC_QUERY_CLIENT_DEFAULT_MAX_RETRY_COUNT,
		NEXT_PUBLIC_VERIFICATION_EMAIL_RESEND_TIMEOUT:
			process.env.VERIFICATION_EMAIL_RESEND_TIMEOUT,
	},
});
