import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { ATTACHMENT_TYPES } from "@/lib/constants";
import { postsTable } from "./posts";

export const attachmentTypeEnum = pgEnum("attachment_type", ATTACHMENT_TYPES);

export const attachmentsTable = pgTable(
	"attachments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		fileType: attachmentTypeEnum("type").notNull(),
		fileUrl: text("file_url").notNull(),
		fileKey: text("file_key").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},

	(table) => [index("attachments_post_id_idx").on(table.postId)]
);

export type Attachment = InferSelectModel<typeof attachmentsTable>;
export type NewAttachment = InferInsertModel<typeof attachmentsTable>;
