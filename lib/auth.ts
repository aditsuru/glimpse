import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/drizzle/db";
import { sendVerificationEmail } from "@/emails/email-service";
import { config } from "@/lib/config";

export const auth = betterAuth({
	user: {
		additionalFields: {
			bio: {
				type: "string",
				required: false,
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
	emailVerification: {
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			sendVerificationEmail({
				name: user.name,
				to: user.email,
				url,
			});
		},
	},
	// socialProviders: {
	// 	github: {
	// 		enabled: true,
	// 		clientKey: "",
	// 		clientSecret: "",
	// 		clientId: "",
	// 	},
	// 	google: {
	// 		enabled: true,
	// 		clientKey: "",
	// 		clientSecret: "",
	// 		clientId: "",
	// 	},
	// },
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
