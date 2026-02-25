import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/db";
import { config } from "@/lib/config";

export const auth = betterAuth({
	user: {
		additionalFields: {
			avatarUrl: {
				type: "string",
			},
			bio: {
				type: "string",
			},
			username: {
				type: "string",
				required: true,
				unique: true,
			},
			isGlimpseVerified: {
				type: "boolean",
				defaultValue: false,
			},
		},
	},
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			enabled: true,
			clientKey: "",
			clientSecret: "",
			clientId: "",
		},
		google: {
			enabled: true,
			clientKey: "",
			clientSecret: "",
			clientId: "",
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
