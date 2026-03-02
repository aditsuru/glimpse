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
	}: z.infer<typeof usersSchema.updateProfile.input> & {
		userId: string;
	}): Promise<z.infer<typeof usersSchema.updateProfile.output>> {
		await this.db.update(user).set(input).where(eq(user.id, userId));
		return { success: true };
	}

	async signIn({
		headers,
		...input
	}: z.infer<typeof usersSchema.signIn.input> & {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signIn.output>> {
		await auth.api.signInEmail({ body: { ...input }, headers });
		return { success: true };
	}

	async signUp({
		headers,
		...input
	}: z.infer<typeof usersSchema.signUp.input> & {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signUp.output>> {
		await auth.api.signUpEmail({ body: { ...input }, headers });
		return { success: true };
	}

	async signOut({
		headers,
	}: {
		headers: ReadonlyHeaders;
	}): Promise<z.infer<typeof usersSchema.signOut.output>> {
		await auth.api.signOut({ headers });
		return { success: true };
	}
}
