import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { generateFromEmail } from "unique-username-generator";
import { db } from "@/drizzle/db";
import { config } from "@/lib/config";

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

	emailAndPassword: {
		enabled: true,
	},
	// emailVerification: {
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	sendVerificationEmail: async ({ user, url }) => {
	// 		sendVerificationEmail({
	// 			name: user.name,
	// 			to: user.email,
	// 			url,
	// 		});
	// 	},
	// },
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
