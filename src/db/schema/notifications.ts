import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { NOTIFICATION_TYPES } from "@/lib/shared/constants";
import { user } from "./auth-schema";

const notificationTypeEnum = pgEnum("notification_type", NOTIFICATION_TYPES);

export const notificationsTable = pgTable(
	"notifications",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		recipientId: text("recipient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		entityId: text("entity_id"),
		actorIds: text("actor_ids").array(),
		type: notificationTypeEnum("type").notNull(),
		message: text("message"),
		link: text("link"),
		isRead: boolean("is_read").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("notifications_recipient_id_idx").on(table.recipientId)]
);

export type Notification = InferSelectModel<typeof notificationsTable>;
export type NewNotification = InferInsertModel<typeof notificationsTable>;
