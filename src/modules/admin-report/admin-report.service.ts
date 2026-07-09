/** biome-ignore-all lint/style/noNonNullAssertion: same pattern as other services */
import { and, desc, eq, inArray, lt } from "drizzle-orm";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { commentsTable } from "@/db/schema/comments";
import { dmcaRequestsTable } from "@/db/schema/dmca-requests";
import { postsTable } from "@/db/schema/posts";
import { profilesTable } from "@/db/schema/profiles";
import { reportsTable } from "@/db/schema/reports";
import { upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import { constructPublicUrl } from "@/lib/server/s3-utils";
import { config } from "@/lib/shared/config";
import type { adminReportSchema } from "./admin-report.schema";

export class AdminReportService {
	constructor(private db: typeof DBType) {}

	async getReports({
		status,
		cursor,
	}: z.infer<typeof adminReportSchema.getReports.input>): Promise<
		z.infer<typeof adminReportSchema.getReports.output>
	> {
		const limit = config.POSTS_PAGINATION_LIMIT;

		const rows = await this.db
			.select()
			.from(reportsTable)
			.where(
				and(
					eq(reportsTable.status, status),
					cursor ? lt(reportsTable.createdAt, cursor) : undefined
				)
			)
			.orderBy(desc(reportsTable.createdAt))
			.limit(limit + 1);

		const hasNext = rows.length > limit;
		const trimmed = hasNext ? rows.slice(0, -1) : rows;
		const nextCursor = hasNext ? trimmed.at(-1)!.createdAt : null;

		if (trimmed.length === 0) return { items: [], nextCursor: null };

		const commentIds = trimmed
			.filter((r) => r.targetCommentId)
			.map((r) => r.targetCommentId!);
		const postIds = trimmed
			.filter((r) => r.targetPostId)
			.map((r) => r.targetPostId!);

		const [comments, posts] = await Promise.all([
			commentIds.length > 0
				? this.db
						.select({ id: commentsTable.id, userId: commentsTable.userId })
						.from(commentsTable)
						.where(inArray(commentsTable.id, commentIds))
				: Promise.resolve([]),
			postIds.length > 0
				? this.db
						.select({ id: postsTable.id, userId: postsTable.userId })
						.from(postsTable)
						.where(inArray(postsTable.id, postIds))
				: Promise.resolve([]),
		]);

		const commentAuthorMap = new Map(comments.map((c) => [c.id, c.userId]));
		const postAuthorMap = new Map(posts.map((p) => [p.id, p.userId]));

		const allUserIds = [
			...new Set(
				trimmed.flatMap((r) => {
					const ids = [r.reporterId];
					if (r.targetType === "user" && r.targetUserId)
						ids.push(r.targetUserId);
					if (r.targetType === "post" && r.targetPostId) {
						const authorId = postAuthorMap.get(r.targetPostId);
						if (authorId) ids.push(authorId);
					}
					if (r.targetType === "comment" && r.targetCommentId) {
						const authorId = commentAuthorMap.get(r.targetCommentId);
						if (authorId) ids.push(authorId);
					}
					return ids;
				})
			),
		];

		const profiles =
			allUserIds.length > 0
				? await this.db
						.select({
							userId: profilesTable.userId,
							username: profilesTable.username,
							displayName: profilesTable.displayName,
							avatarKey: profilesTable.avatarKey,
							updatedAt: profilesTable.updatedAt,
						})
						.from(profilesTable)
						.where(inArray(profilesTable.userId, allUserIds))
				: [];

		const profileMap = new Map(
			profiles.map((p) => [
				p.userId,
				{
					userId: p.userId,
					username: p.username,
					displayName: p.displayName,
					avatarUrl: p.avatarKey
						? constructPublicUrl({ key: p.avatarKey, updatedAt: p.updatedAt })
								.publicUrl
						: null,
				},
			])
		);

		const items = trimmed.map((r) => {
			let offenderId: string | null = null;
			if (r.targetType === "user") offenderId = r.targetUserId;
			if (r.targetType === "post" && r.targetPostId)
				offenderId = postAuthorMap.get(r.targetPostId) ?? null;
			if (r.targetType === "comment" && r.targetCommentId)
				offenderId = commentAuthorMap.get(r.targetCommentId) ?? null;

			return {
				id: r.id,
				reporter: profileMap.get(r.reporterId)!,
				targetType: r.targetType,
				targetPostId: r.targetPostId,
				targetCommentId: r.targetCommentId,
				targetUser: offenderId ? (profileMap.get(offenderId) ?? null) : null,
				reason: r.reason,
				body: r.body,
				status: r.status,
				createdAt: r.createdAt,
			};
		});

		return { items, nextCursor };
	}

	async resolveReport({
		reportId,
		outcome,
	}: z.infer<typeof adminReportSchema.resolveReport.input>): Promise<
		z.infer<typeof adminReportSchema.resolveReport.output>
	> {
		const report = await this.db
			.select({ reporterId: reportsTable.reporterId })
			.from(reportsTable)
			.where(eq(reportsTable.id, reportId))
			.limit(1)
			.then((r) => r[0]);

		if (!report) return { success: true };

		await this.db
			.update(reportsTable)
			.set({ status: outcome })
			.where(eq(reportsTable.id, reportId));

		void upsertNotification({
			type: "system",
			recipientId: report.reporterId,
			body:
				outcome === "resolved"
					? "Thanks for your report. We reviewed it and took action."
					: "We reviewed your report and didn't find a violation of our guidelines.",
		}).catch((e) =>
			logger.error({ err: e }, "report closure notification failed")
		);

		return { success: true };
	}

	async getDmcaRequests({
		status,
		cursor,
	}: z.infer<typeof adminReportSchema.getDmcaRequests.input>): Promise<
		z.infer<typeof adminReportSchema.getDmcaRequests.output>
	> {
		const limit = config.POSTS_PAGINATION_LIMIT;

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

		return {
			items: trimmed,
			nextCursor,
		};
	}

	async resolveDmcaRequest({
		requestId,
		outcome,
	}: z.infer<typeof adminReportSchema.resolveDmcaRequest.input>): Promise<
		z.infer<typeof adminReportSchema.resolveDmcaRequest.output>
	> {
		await this.db
			.update(dmcaRequestsTable)
			.set({ status: outcome })
			.where(eq(dmcaRequestsTable.id, requestId));

		return { success: true };
	}
}
