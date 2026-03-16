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

export const postLikesTable = pgTable(
	"post_likes",
	{
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.postId, table.userId] }),
		index("post_likes_post_id_idx").on(table.postId),
	]
);

export type PostLike = InferSelectModel<typeof postLikesTable>;
export type NewPostLike = InferInsertModel<typeof postLikesTable>;
