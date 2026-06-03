import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { account, user } from "@/db/schema/auth-schema";
import { auth } from "@/lib/server/auth";
import type { accountSchema } from "./account.schema";

export class AccountService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async getSecuritySettings(): Promise<
		z.infer<typeof accountSchema.getSecuritySettings.output>
	> {
		const [userData, linkedAccounts] = await Promise.all([
			this.db
				.select({ email: user.email })
				.from(user)
				.where(eq(user.id, this.userId))
				.limit(1)
				.then((res) => res[0]),
			this.db
				.select({ providerId: account.providerId })
				.from(account)
				.where(eq(account.userId, this.userId)),
		]);

		const providers = linkedAccounts.map((acc) => acc.providerId);
		const hasPassword = providers.includes("credential");
		const oauthProviders = providers.filter((p) => p !== "credential");

		return {
			email: userData?.email ?? "",
			hasPassword,
			oauthProviders,
		};
	}

	async setPassword({
		newPassword,
	}: z.infer<typeof accountSchema.setPassword.input>): Promise<
		z.infer<typeof accountSchema.setPassword.output>
	> {
		await auth.api.setPassword({
			body: { newPassword },
			headers: await headers(),
		});

		return { success: true };
	}

	async verifyPassword({
		password,
	}: z.infer<typeof accountSchema.verifyPassword.input>): Promise<
		z.infer<typeof accountSchema.verifyPassword.output>
	> {
		const result = await auth.api.verifyPassword({
			body: { password },
			headers: await headers(),
		});

		return { valid: result.status };
	}
}
