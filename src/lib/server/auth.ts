import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { generateFromEmail } from "unique-username-generator";
import { db } from "@/db";
import { sendResetPasswordEmail, sendVerificationEmail } from "@/emails/email";
import { config } from "@/lib/shared/config";
import { redis } from "./redis";

export const auth = betterAuth({
	user: {
		additionalFields: {
			username: {
				type: "string",
				required: true,
				unique: true,
			},
		},
	},

	rateLimit: {
		window: config.AUTH_RATE_LIMIT_WINDOW,
		max: config.AUTH_RATE_LIMIT_MAX,
	},

	secondaryStorage: {
		get: async (key) => {
			const value = await redis.get(key);
			if (!value) return null;
			return typeof value === "object" ? JSON.stringify(value) : String(value);
		},
		set: async (key, value, ttl) => {
			if (ttl) await redis.set(key, value, { ex: ttl });
			else await redis.set(key, value);
		},
		delete: async (key) => {
			await redis.del(key);
		},
	},

	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			await sendResetPasswordEmail({
				username: user.name,
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
				username: user.name,
				to: user.email,
				verificationUrl: url,
			});
		},
	},

	socialProviders: {
		github: {
			clientId: config.GITHUB_CLIENT_ID,
			clientSecret: config.GITHUB_CLIENT_SECRET,
			mapProfileToUser: (profile) => ({
				username: generateFromEmail(profile.email, 3),
			}),
		},
		google: {
			clientId: config.GOOGLE_CLIENT_ID,
			clientSecret: config.GOOGLE_CLIENT_SECRET,
			mapProfileToUser: (profile) => ({
				username: generateFromEmail(profile.email, 3),
			}),
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
