/** biome-ignore-all lint/style/noNonNullAssertion: none */
import { ORPCError } from "@orpc/server";
import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { DatabaseError } from "pg";
import type * as z from "zod";
import type { db as DBType } from "@/db";
import { commentsTable } from "@/db/schema/comments";
import { postsTable } from "@/db/schema/posts";
import { profilesTable } from "@/db/schema/profiles";
import { reportsTable } from "@/db/schema/reports";
import { getAdminUserIds, upsertNotification } from "@/lib/server/helpers";
import { logger } from "@/lib/server/logger";
import { constructPublicUrl } from "@/lib/server/s3-utils";
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
			const cause = error instanceof Error ? error.cause : undefined;

			if (cause instanceof DatabaseError && cause.code === "23505") {
				throw new ORPCError("CONFLICT", {
					message: "You've already reported this.",
				});
			}
			if (cause instanceof DatabaseError && cause.code === "23503") {
				throw new ORPCError("NOT_FOUND", { message: "Content not found." });
			}
			throw error;
		}

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

	async getAll({
		status,
		cursor,
	}: z.infer<typeof reportSchema.getAll.input>): Promise<
		z.infer<typeof reportSchema.getAll.output>
	> {
		const limit = 20;

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

		const reporterIds = [...new Set(trimmed.map((r) => r.reporterId))];
		const postIds = [
			...new Set(
				trimmed.filter((r) => r.targetPostId).map((r) => r.targetPostId!)
			),
		];
		const commentIds = [
			...new Set(
				trimmed.filter((r) => r.targetCommentId).map((r) => r.targetCommentId!)
			),
		];
		const directTargetUserIds = [
			...new Set(
				trimmed.filter((r) => r.targetUserId).map((r) => r.targetUserId!)
			),
		];

		const [reporterProfiles, posts, comments] = await Promise.all([
			this.db
				.select({
					userId: profilesTable.userId,
					username: profilesTable.username,
					displayName: profilesTable.displayName,
					avatarKey: profilesTable.avatarKey,
					updatedAt: profilesTable.updatedAt,
				})
				.from(profilesTable)
				.where(inArray(profilesTable.userId, reporterIds)),
			postIds.length > 0
				? this.db
						.select({
							id: postsTable.id,
							body: postsTable.body,
							userId: postsTable.userId,
						})
						.from(postsTable)
						.where(inArray(postsTable.id, postIds))
				: Promise.resolve([]),
			commentIds.length > 0
				? this.db
						.select({
							id: commentsTable.id,
							body: commentsTable.body,
							postId: commentsTable.postId,
							userId: commentsTable.userId,
						})
						.from(commentsTable)
						.where(inArray(commentsTable.id, commentIds))
				: Promise.resolve([]),
		]);

		// Resolve offender userIds: direct user reports + post authors + comment authors
		const offenderIds = [
			...new Set([
				...directTargetUserIds,
				...posts.map((p) => p.userId),
				...comments.map((c) => c.userId),
			]),
		];

		const offenderProfiles =
			offenderIds.length > 0
				? await this.db
						.select({
							userId: profilesTable.userId,
							username: profilesTable.username,
							displayName: profilesTable.displayName,
							avatarKey: profilesTable.avatarKey,
							updatedAt: profilesTable.updatedAt,
						})
						.from(profilesTable)
						.where(inArray(profilesTable.userId, offenderIds))
				: [];

		const toActor = (p: {
			userId: string;
			username: string;
			displayName: string;
			avatarKey: string | null;
			updatedAt: Date;
		}) => ({
			userId: p.userId,
			username: p.username,
			displayName: p.displayName,
			avatarUrl: p.avatarKey
				? constructPublicUrl({ key: p.avatarKey, updatedAt: p.updatedAt })
						.publicUrl
				: null,
		});

		const reporterMap = new Map(
			reporterProfiles.map((p) => [p.userId, toActor(p)])
		);
		const offenderMap = new Map(
			offenderProfiles.map((p) => [p.userId, toActor(p)])
		);
		const postMap = new Map(posts.map((p) => [p.id, p]));
		const commentMap = new Map(comments.map((c) => [c.id, c]));

		const items = trimmed.map((r) => {
			const post = r.targetPostId ? postMap.get(r.targetPostId) : undefined;
			const comment = r.targetCommentId
				? commentMap.get(r.targetCommentId)
				: undefined;

			const offenderId =
				r.targetUserId ?? post?.userId ?? comment?.userId ?? null;

			return {
				id: r.id,
				targetType: r.targetType,
				reason: r.reason,
				body: r.body,
				status: r.status,
				adminNotes: r.adminNotes,
				createdAt: r.createdAt,
				reporter: reporterMap.get(r.reporterId)!,
				targetPostId: r.targetPostId,
				targetCommentId: r.targetCommentId,
				targetUserId: r.targetUserId,
				offender: offenderId ? (offenderMap.get(offenderId) ?? null) : null,
				postPreview: post ? { id: post.id, body: post.body } : null,
				commentPreview: comment
					? { id: comment.id, body: comment.body, postId: comment.postId }
					: null,
			};
		});

		return { items, nextCursor };
	}

	async resolve({
		reportId,
		action,
		adminNotes,
	}: z.infer<typeof reportSchema.resolve.input>): Promise<
		z.infer<typeof reportSchema.resolve.output>
	> {
		const report = await this.db
			.select()
			.from(reportsTable)
			.where(eq(reportsTable.id, reportId))
			.limit(1)
			.then((r) => r[0]);

		if (!report)
			throw new ORPCError("NOT_FOUND", { message: "Report not found." });

		const newStatus = action === "resolve" ? "resolved" : "dismissed";

		await this.db
			.update(reportsTable)
			.set({ status: newStatus, adminNotes })
			.where(eq(reportsTable.id, reportId));

		void upsertNotification({
			type: "system",
			recipientId: report.reporterId,
			body:
				action === "resolve"
					? "Thanks for your report. We've reviewed it and taken action."
					: "Thanks for your report. After review, we didn't find a violation of our guidelines.",
		}).catch((e) => logger.error({ err: e }, "reporter notification failed"));

		return { success: true };
	}

	async deleteContent({
		reportId,
	}: z.infer<typeof reportSchema.deleteContent.input>): Promise<
		z.infer<typeof reportSchema.deleteContent.output>
	> {
		const report = await this.db
			.select()
			.from(reportsTable)
			.where(eq(reportsTable.id, reportId))
			.limit(1)
			.then((r) => r[0]);

		if (!report)
			throw new ORPCError("NOT_FOUND", { message: "Report not found." });

		let offenderId: string | null = null;

		if (report.targetPostId) {
			const post = await this.db
				.select({ userId: postsTable.userId })
				.from(postsTable)
				.where(eq(postsTable.id, report.targetPostId))
				.limit(1)
				.then((r) => r[0]);
			offenderId = post?.userId ?? null;
			await this.db
				.delete(postsTable)
				.where(eq(postsTable.id, report.targetPostId));
		} else if (report.targetCommentId) {
			const comment = await this.db
				.select({ userId: commentsTable.userId })
				.from(commentsTable)
				.where(eq(commentsTable.id, report.targetCommentId))
				.limit(1)
				.then((r) => r[0]);
			offenderId = comment?.userId ?? null;
			await this.db
				.delete(commentsTable)
				.where(eq(commentsTable.id, report.targetCommentId));
		}

		if (offenderId) {
			void upsertNotification({
				type: "system",
				recipientId: offenderId,
				body: "One of your posts or comments was removed for violating our community guidelines.",
			}).catch((e) => logger.error({ err: e }, "offender notification failed"));
		}

		return { success: true };
	}
}
