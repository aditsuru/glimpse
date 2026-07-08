import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { bansTable } from "@/db/schema/bans";
import { upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import type { banSchema } from "./ban.schema";

export class BanService {
	constructor(
		private db: typeof DBType,
		private adminId: string
	) {}

	async create({
		userId,
		reason,
		isPermanent,
		durationDays,
	}: z.infer<typeof banSchema.create.input>): Promise<
		z.infer<typeof banSchema.create.output>
	> {
		const targetUser = await this.db
			.select({ email: user.email })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1)
			.then((r) => r[0]);

		if (!targetUser) {
			throw new ORPCError("NOT_FOUND", { message: "User not found." });
		}

		const email = targetUser.email.toLowerCase();
		const expiresAt =
			!isPermanent && durationDays
				? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
				: null;

		await this.db
			.insert(bansTable)
			.values({
				userId,
				email,
				reason,
				bannedBy: this.adminId,
				isPermanent,
				expiresAt,
			})
			.onConflictDoUpdate({
				target: bansTable.email,
				set: { userId, reason, bannedBy: this.adminId, isPermanent, expiresAt },
			});

		if (isPermanent) {
			await this.db.delete(user).where(eq(user.id, userId));
		} else {
			void upsertNotification({
				type: "system",
				recipientId: userId,
				body: `Your account has been suspended${expiresAt ? ` until ${expiresAt.toLocaleDateString()}` : ""}. Reason: ${reason}`,
			}).catch((e) => logger.error({ err: e }, "ban notification failed"));
		}

		return { success: true };
	}
}
