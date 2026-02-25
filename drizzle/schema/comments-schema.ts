import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { postsTable } from "./posts-schema";

export const commentsTable = pgTable(
	"comments",
	{
		id: uuid().defaultRandom().primaryKey(),
		body: text("body").notNull(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: uuid("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		parentCommentId: uuid("parent_comment_id"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("comment_post_idx").on(table.postId),
		index("comment_created_idx").on(table.createdAt),
		foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comment_parent_fk",
		}).onDelete("cascade"),
	]
);

export type Comment = InferSelectModel<typeof commentsTable>;
export type NewComment = InferInsertModel<typeof commentsTable>;
