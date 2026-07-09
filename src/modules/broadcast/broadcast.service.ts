import type * as z from "zod";
import type { db as DBType } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { notificationsTable } from "@/db/schema/notifications";
import type { broadcastSchema } from "./broadcast.schema";

export class BroadcastService {
	constructor(private db: typeof DBType) {}

	async send({
		body,
	}: z.infer<typeof broadcastSchema.send.input>): Promise<
		z.infer<typeof broadcastSchema.send.output>
	> {
		const allUsers = await this.db.select({ id: user.id }).from(user);
		if (allUsers.length === 0) return { success: true, count: 0 };

		const CHUNK_SIZE = 500;
		for (let i = 0; i < allUsers.length; i += CHUNK_SIZE) {
			const chunk = allUsers.slice(i, i + CHUNK_SIZE);
			await this.db.insert(notificationsTable).values(
				chunk.map((u) => ({
					recipientId: u.id,
					type: "system" as const,
					body,
					actorIds: [],
					actorCount: 0,
					groupKey: null,
				}))
			);
		}

		return { success: true, count: allUsers.length };
	}
}
