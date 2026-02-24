import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const config = createEnv({
	server: {
		// General
		NODE_ENV: z
			.enum(["production", "development", "testing", "staging"])
			.default("development"),

		// Database
		DATABASE_URL: z.string().url(),

		// Better auth config
		COOKIE_CACHE_AGE: z.number().nonnegative(),
	},
	client: {},
	experimental__runtimeEnv: {},
});
