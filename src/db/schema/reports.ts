import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { customNanoid } from "@/lib/server/helpers";
import { user } from "./auth-schema";
import { commentsTable } from "./comments";
import { postsTable } from "./posts";

export const ReportReasonEnum = pgEnum("report_reason", [
	"spam",
	"nsfw",
	"harassment",
	"hate_speech",
	"self_harm",
	"misinformation",
	"copyright",
	"other",
]);

export const ReportTargetTypeEnum = pgEnum("report_target_type", [
	"post",
	"comment",
	"user",
]);

export const ReportStatusEnum = pgEnum("report_status", [
	"pending",
	"resolved",
	"dismissed",
]);

export const reportsTable = pgTable(
	"reports",
	{
		id: text("id")
			.$defaultFn(() => customNanoid())
			.primaryKey()
			.notNull(),

		reporterId: text("reporter_id")
			.notNull()
			.references(() => user.id, { onDelete: "set null" }),

		targetType: ReportTargetTypeEnum("target_type").notNull(),

		targetPostId: text("target_post_id").references(() => postsTable.id, {
			onDelete: "set null",
		}),
		targetCommentId: text("target_comment_id").references(
			() => commentsTable.id,
			{ onDelete: "set null" }
		),
		targetUserId: text("target_user_id").references(() => user.id, {
			onDelete: "set null",
		}),

		reason: ReportReasonEnum("reason").notNull(),
		body: text("body"),

		status: ReportStatusEnum("status").notNull().default("pending"),

		adminNotes: text("admin_notes"),

		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("reports_reporter_id_idx").on(table.reporterId),
		index("reports_status_idx").on(table.status),
		index("reports_target_post_id_idx").on(table.targetPostId),
		index("reports_target_comment_id_idx").on(table.targetCommentId),
		index("reports_target_user_id_idx").on(table.targetUserId),
		uniqueIndex("reports_reporter_post_uidx")
			.on(table.reporterId, table.targetPostId)
			.where(sql`${table.targetPostId} IS NOT NULL`),
		uniqueIndex("reports_reporter_comment_uidx")
			.on(table.reporterId, table.targetCommentId)
			.where(sql`${table.targetCommentId} IS NOT NULL`),
		uniqueIndex("reports_reporter_user_uidx")
			.on(table.reporterId, table.targetUserId)
			.where(sql`${table.targetUserId} IS NOT NULL`),
	]
);

export type Report = InferSelectModel<typeof reportsTable>;
export type NewReport = InferInsertModel<typeof reportsTable>;
export const reportSelectSchema = createSelectSchema(reportsTable);
