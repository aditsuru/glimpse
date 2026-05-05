import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { user } from "./auth-schema";
import { postsTable } from "./posts";

export const viewHistoryTable = pgTable(
	"view_history",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: uuid("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.postId] }),
		index("view_history_user_id_idx").on(table.userId),
		index("view_history_post_id_idx").on(table.postId),
	]
);

export type ViewHistory = InferSelectModel<typeof viewHistoryTable>;
export type NewViewHistory = InferInsertModel<typeof viewHistoryTable>;
export const viewHistorySelectSchema = createSelectSchema(viewHistoryTable);
