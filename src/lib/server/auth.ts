import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profilesTable } from "@/db/schema";
import { sendResetPasswordEmail, sendVerificationEmail } from "@/emails/email";
import { config } from "@/lib/shared/config";
import { REDIS_KEYS, redis } from "./redis";

export const auth = betterAuth({
	rateLimit: {
		window: config.AUTH_RATE_LIMIT_WINDOW,
		max: config.AUTH_RATE_LIMIT_MAX,
	},

	secondaryStorage: {
		get: async (key) => {
			const value = await redis.get(REDIS_KEYS.FROM_KEY(key));
			if (!value) return null;
			return typeof value === "object" ? JSON.stringify(value) : String(value);
		},
		set: async (key, value, ttl) => {
			if (ttl) await redis.set(REDIS_KEYS.FROM_KEY(key), value, { ex: ttl });
			else await redis.set(REDIS_KEYS.FROM_KEY(key), value);
		},
		delete: async (key) => {
			await redis.del(REDIS_KEYS.FROM_KEY(key));
		},
	},

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			const profile = await db
				.select({
					username: profilesTable.username,
				})
				.from(profilesTable)
				.where(eq(profilesTable.userId, user.id))
				.limit(1);

			await sendResetPasswordEmail({
				username: profile[0].username,
				to: user.email,
				resetPasswordUrl: url,
			});
		},
	},

	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			sendVerificationEmail({
				to: user.email,
				verificationUrl: url,
			});
		},
	},

	socialProviders: {
		github: {
			clientId: config.GITHUB_CLIENT_ID,
			clientSecret: config.GITHUB_CLIENT_SECRET,
		},
		google: {
			clientId: config.GOOGLE_CLIENT_ID,
			clientSecret: config.GOOGLE_CLIENT_SECRET,
		},
	},

	session: {
		cookieCache: {
			enabled: true,
			maxAge: config.COOKIE_CACHE_AGE,
		},
	},

	plugins: [nextCookies()],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
});
