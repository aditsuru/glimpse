import { createEnv } from "@t3-oss/env-nextjs";
import ms, { type StringValue } from "ms";
import { z } from "zod";

/** Parse a human-readable time string (e.g. "5m", "10s") into milliseconds */
const msMs = z
	.string()
	.transform((val) => ms(val as StringValue))
	.refine((val) => !Number.isNaN(val), {
		message: "Invalid time string (e.g. '5m', '10s')",
	});

/** Same but outputs seconds (for Better Auth which wants seconds) */
const msSec = z
	.string()
	.transform((val) => ms(val as StringValue) / 1000)
	.refine((val) => !Number.isNaN(val), {
		message: "Invalid time string (e.g. '5m', '10s')",
	});

export const config = createEnv({
	server: {
		// ── Runtime ───────────────────────────────────────────────────
		NODE_ENV: z
			.enum(["production", "development", "test"])
			.default("development"),

		// ── Database ──────────────────────────────────────────────────
		DATABASE_URL: z.url(),

		// ── Redis (Upstash) ───────────────────────────────────────────
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string(),
		REDIS_FEED_SEEN_MAX_ITEMS: z.coerce.number().positive().default(500),

		// ── Storage ───────────────────────────────────────────────────
		// Local dev: set S3_ENDPOINT to MinIO URL (http://localhost:9000)
		// Staging/Prod: omit S3_ENDPOINT, set CLOUDFLARE_ACCOUNT_ID instead
		S3_ENDPOINT: z.url().optional(),
		CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
		R2_ACCESS_KEY_ID: z.string().default("minioadmin"),
		R2_SECRET_ACCESS_KEY: z.string().default("minioadmin"),
		R2_BUCKET_NAME: z.string().default("glimpse-dev"),
		R2_PUBLIC_URL: z.url().default("http://localhost:9000/glimpse-dev"),

		// ── Auth (Better Auth) ────────────────────────────────────────
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),
		COOKIE_CACHE_AGE: msSec.default(300),

		// ── OAuth ─────────────────────────────────────────────────────
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		GITHUB_CLIENT_ID: z.string(),
		GITHUB_CLIENT_SECRET: z.string(),

		// ── Email ─────────────────────────────────────────────────────
		RESEND_API_KEY: z.string(),

		// ── Cron (QStash) ─────────────────────────────────────────────
		QSTASH_URL: z.url(),
		QSTASH_TOKEN: z.string(),
		QSTASH_CURRENT_SIGNING_KEY: z.string(),
		QSTASH_NEXT_SIGNING_KEY: z.string(),

		// ── Rate limiting ─────────────────────────────────────────────
		RATE_LIMIT_MAX: z.coerce.number().positive().default(60),
		RATE_LIMIT_WINDOW: msSec.default(10),
		AUTH_RATE_LIMIT_MAX: z.coerce.number().positive().default(10),
		AUTH_RATE_LIMIT_WINDOW: msSec.default(10),

		// ── Pagination ────────────────────────────────────────────────
		POSTS_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
		COMMENTS_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
		PROFILE_PAGINATION_LIMIT: z.coerce.number().positive().default(10),
	},

	client: {
		// ── App ───────────────────────────────────────────────────────
		NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),

		// ── Content limits ────────────────────────────────────────────
		NEXT_PUBLIC_POST_CHAR_LIMIT: z.coerce.number().positive().default(300),
		NEXT_PUBLIC_BIO_CHAR_LIMIT: z.coerce.number().positive().default(150),

		// ── Email cooldowns ───────────────────────────────────────────
		NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT: msMs.default(60000),

		// ── React Query ───────────────────────────────────────────────
		NEXT_PUBLIC_QUERY_STALE_TIME: msMs.default(300000),
		NEXT_PUBLIC_QUERY_GC_TIME: msMs.default(300000),
		NEXT_PUBLIC_QUERY_MAX_RETRIES: z.coerce.number().nonnegative().default(1),
	},

	experimental__runtimeEnv: {
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_POST_CHAR_LIMIT: process.env.NEXT_PUBLIC_POST_CHAR_LIMIT,
		NEXT_PUBLIC_BIO_CHAR_LIMIT: process.env.NEXT_PUBLIC_BIO_CHAR_LIMIT,
		NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT:
			process.env.NEXT_PUBLIC_EMAIL_RESEND_TIMEOUT,
		NEXT_PUBLIC_QUERY_STALE_TIME: process.env.NEXT_PUBLIC_QUERY_STALE_TIME,
		NEXT_PUBLIC_QUERY_GC_TIME: process.env.NEXT_PUBLIC_QUERY_GC_TIME,
		NEXT_PUBLIC_QUERY_MAX_RETRIES: process.env.NEXT_PUBLIC_QUERY_MAX_RETRIES,
	},
});
