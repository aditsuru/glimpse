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
}
