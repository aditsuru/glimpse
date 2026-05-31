import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { commentsTable } from "@/db/schema/comments";
import { user } from "./auth-schema";

export const commentLikesTable = pgTable(
	"comment_likes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		commentId: text("comment_id")
			.notNull()
			.references(() => commentsTable.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.commentId] }),
		index("comment_likes_user_id_idx").on(table.userId),
		index("comment_likes_comment_id_idx").on(table.commentId),
	]
);

export type CommentLike = InferSelectModel<typeof commentLikesTable>;
export type NewCommentLike = InferInsertModel<typeof commentLikesTable>;
export const commentLikeSelectSchema = createSelectSchema(commentLikesTable);
