import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { commentsTable } from "./comments";

export const commentLikesTable = pgTable(
	"comment_likes",
	{
		commentId: text("comment_id")
			.notNull()
			.references(() => commentsTable.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.commentId, table.userId] }),
		index("comment_likes_comment_id_idx").on(table.commentId),
	]
);

export type CommentLike = InferSelectModel<typeof commentLikesTable>;
export type NewCommentLike = InferInsertModel<typeof commentLikesTable>;
