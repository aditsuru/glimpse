import { ORPCError } from "@orpc/server";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { reportsTable } from "@/db/schema/reports";
import { getAdminUserIds, upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import type { reportSchema } from "./report.schema";

export class ReportService {
	constructor(
		private db: typeof DBType,
		private userId: string
	) {}

	async create({
		targetType,
		targetId,
		reason,
		body,
	}: z.infer<typeof reportSchema.create.input>): Promise<
		z.infer<typeof reportSchema.create.output>
	> {
		try {
			await this.db.insert(reportsTable).values({
				reporterId: this.userId,
				targetType,
				targetPostId: targetType === "post" ? targetId : null,
				targetCommentId: targetType === "comment" ? targetId : null,
				targetUserId: targetType === "user" ? targetId : null,
				reason,
				body,
			});
		} catch (error) {
			if (error instanceof DatabaseError && error.code === "23505") {
				throw new ORPCError("CONFLICT", {
					message: "You've already reported this.",
				});
			}
			if (error instanceof DatabaseError && error.code === "23503") {
				throw new ORPCError("NOT_FOUND", { message: "Content not found." });
			}
			throw error;
		}

		// Notify all admins — fire and forget
		void getAdminUserIds(this.db)
			.then((adminIds) =>
				Promise.all(
					adminIds.map((adminId) =>
						upsertNotification({
							type: "system",
							recipientId: adminId,
							body: `New report filed: ${reason} on ${targetType}`,
						})
					)
				)
			)
			.catch((e) => logger.error({ err: e }, "admin notification failed"));

		return { success: true };
	}
}
