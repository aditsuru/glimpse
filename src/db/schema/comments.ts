import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { customNanoid } from "@/lib/server/helpers";
import { user } from "./auth-schema";
import { postsTable } from "./posts";

export const commentsTable = pgTable(
	"comments",
	{
		id: text("id")
			.$defaultFn(() => customNanoid())
			.primaryKey()
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		parentCommentId: text("parent_comment_id"),
		body: text("body").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comment_parent_fk",
		}).onDelete("cascade"),
		index("comments_user_id_idx").on(table.userId),
		index("comments_post_id_idx").on(table.postId),
	]
);

export type Comment = InferSelectModel<typeof commentsTable>;
export type NewComment = InferInsertModel<typeof commentsTable>;

export const commentSelectSchema = createSelectSchema(commentsTable);
