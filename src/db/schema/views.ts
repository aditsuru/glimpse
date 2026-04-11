import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { postsTable } from "./posts";

export const viewsTable = pgTable(
	"views",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.postId] }),
		index("views_user_id_idx").on(table.userId),
		index("views_post_id_idx").on(table.postId),
	]
);

export type View = InferSelectModel<typeof viewsTable>;
export type NewView = InferInsertModel<typeof viewsTable>;
