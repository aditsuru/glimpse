import { ORPCError } from "@orpc/client";
import { eq } from "drizzle-orm";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import type * as z from "zod";
import type { db as DBType } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import { auth } from "@/lib/auth";
import type { usersSchema } from "./users.schema";

export class UserService {
	constructor(private db: typeof DBType) {}

	async updateProfile({
		userId,
		...input
	}: z.infer<typeof usersSchema.profile.input> & {
		userId: string;
	}): Promise<z.infer<typeof usersSchema.profile.output>> {
		try {
			this.db.update(user).set(input).where(eq(user.id, userId));
			return { success: true };
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Fail to update profile.",
				cause: e,
			});
		}
	}

	async signIn({
		headers,
		...input
	}: z.infer<typeof usersSchema.signIn.input> & {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signIn.output>> {
		try {
			await auth.api.signInEmail({ body: { ...input }, headers });
			return { success: true };
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to sign in, please try again.",
				cause: e,
			});
		}
	}

	async signUp({
		headers,
		...input
	}: z.infer<typeof usersSchema.signUp.input> & {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signUp.output>> {
		try {
			await auth.api.signUpEmail({ body: { ...input }, headers });
			return { success: true };
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to sign up, please try again.",
				cause: e,
			});
		}
	}

	async signOut({
		headers,
	}: {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signOut.output>> {
		try {
			await auth.api.signOut({ headers });
			return { success: true };
		} catch (e: unknown) {
			if (e instanceof ORPCError) throw e;

			throw new ORPCError("INTERNAL_SERVER_ERROR", {
				message: "Failed to sign out user, please try again.",
				cause: e,
			});
		}
	}
}
