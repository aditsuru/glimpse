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

export const bookmarksTable = pgTable(
	"bookmarks",
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
		index("bookmarks_user_id_idx").on(table.userId),
		index("bookmarks_post_id_idx").on(table.postId),
	]
);

export type Bookmark = InferSelectModel<typeof bookmarksTable>;
export type NewBookmark = InferInsertModel<typeof bookmarksTable>;
