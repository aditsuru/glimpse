/** biome-ignore-all lint/style/noNonNullAssertion: none */
import { ORPCError } from "@orpc/server";
import { and, desc, eq, lt } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { dmcaRequestsTable } from "@/db/schema/dmca-requests";
import { getAdminUserIds, upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import type { dmcaSchema } from "./dmca.schema";

export class DmcaService {
	constructor(private db: typeof DBType) {}

	async create(
		input: z.infer<typeof dmcaSchema.create.input>
	): Promise<z.infer<typeof dmcaSchema.create.output>> {
		await this.db.insert(dmcaRequestsTable).values(input);

		void getAdminUserIds(this.db)
			.then((adminIds) =>
				Promise.all(
					adminIds.map((adminId) =>
						upsertNotification({
							type: "system",
							recipientId: adminId,
							body: `New DMCA takedown request from ${input.fullName}.`,
						})
					)
				)
			)
			.catch((e) => logger.error({ err: e }, "admin notification failed"));

		return { success: true };
	}

	async getAll({
		status,
		cursor,
	}: z.infer<typeof dmcaSchema.getAll.input>): Promise<
		z.infer<typeof dmcaSchema.getAll.output>
	> {
		const limit = 20;

		const rows = await this.db
			.select()
			.from(dmcaRequestsTable)
			.where(
				and(
					eq(dmcaRequestsTable.status, status),
					cursor ? lt(dmcaRequestsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(dmcaRequestsTable.createdAt))
			.limit(limit + 1);

		const hasNext = rows.length > limit;
		const trimmed = hasNext ? rows.slice(0, -1) : rows;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		return { items: trimmed, nextCursor };
	}

	async resolve({
		dmcaId,
		action,
		adminNotes,
	}: z.infer<typeof dmcaSchema.resolve.input>): Promise<
		z.infer<typeof dmcaSchema.resolve.output>
	> {
		const request = await this.db
			.select()
			.from(dmcaRequestsTable)
			.where(eq(dmcaRequestsTable.id, dmcaId))
			.limit(1)
			.then((r) => r[0]);

		if (!request)
			throw new ORPCError("NOT_FOUND", { message: "Request not found." });

		const newStatus = action === "resolve" ? "resolved" : "dismissed";

		await this.db
			.update(dmcaRequestsTable)
			.set({ status: newStatus, adminNotes })
			.where(eq(dmcaRequestsTable.id, dmcaId));

		return { success: true };
	}
}
