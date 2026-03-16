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
	},
	client: {},
	experimental__runtimeEnv: {},
});
