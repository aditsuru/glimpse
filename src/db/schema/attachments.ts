import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { postsTable } from "./posts";

export const attachmentsTable = pgTable(
	"attachments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		mimeType: text("mime_type").notNull(),
		attachmentKey: text("attachment_key").notNull(),
		spoiler: boolean("spoiler").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [index("attachments_post_id_idx").on(table.postId)]
);

export type Attachment = InferSelectModel<typeof attachmentsTable>;
export type NewAttachment = InferInsertModel<typeof attachmentsTable>;

export const attachmentSelectSchema = createSelectSchema(attachmentsTable);
