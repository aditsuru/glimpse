import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
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

export const NotificationTypeEnum = pgEnum("notification_type", [
	"like",
	"comment",
	"reply",
	"comment_like",
	"follow",
	"follow_accept",
	"system",
]);

export type NotificationTypeEnumType =
	(typeof NotificationTypeEnum.enumValues)[number];

export const notificationsTable = pgTable(
	"notifications",
	{
		id: text("id")
			.$defaultFn(() => customNanoid())
			.primaryKey()
			.notNull(),

		recipientId: text("recipient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),

		type: NotificationTypeEnum("type").notNull(),

		postId: text("post_id").references(() => postsTable.id, {
			onDelete: "cascade",
		}),

		commentId: text("comment_id").references(() => commentsTable.id, {
			onDelete: "cascade",
		}),

		groupKey: text("group_key"),

		actorIds: text("actor_ids").array().notNull().default([]),

		actorCount: integer("actor_count").notNull().default(0),

		body: text("body"),

		read: boolean("read").notNull().default(false),

		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("notifications_recipient_id_idx").on(table.recipientId),
		index("notifications_group_key_idx").on(table.groupKey),
		uniqueIndex("notifications_recipient_group_key_uidx").on(
			table.recipientId,
			table.groupKey
		),
	]
);

export type Notification = InferSelectModel<typeof notificationsTable>;
export type NewNotification = InferInsertModel<typeof notificationsTable>;
export const notificationSelectSchema = createSelectSchema(notificationsTable);
