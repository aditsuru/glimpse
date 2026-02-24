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
				required: false,
				defaultValue: null,
			},
			bio: {
				type: "string",
				required: false,
				defaultValue: null,
			},
			username: {
				type: "string",
				required: false,
				defaultValue: null,
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
