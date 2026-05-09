import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { user } from "./auth-schema";
import { postsTable } from "./posts";

export const postLikesTable = pgTable(
	"post_likes",
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
		index("user_id_post_id_idx").on(table.userId),
		index("post_id_user_id_idx").on(table.postId),
	]
);

export type PostLike = InferSelectModel<typeof postLikesTable>;
export type NewPostLike = InferInsertModel<typeof postLikesTable>;
export const postLikeSelectSchema = createSelectSchema(postLikesTable);
