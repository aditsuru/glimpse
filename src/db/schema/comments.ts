import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	type AnyPgColumn,
	index,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./auth-schema";
import { postsTable } from "./posts";

export const commentsTable = pgTable(
	"comments",
	{
		id: text("id")
			.$defaultFn(() => nanoid(10))
			.primaryKey(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: text("post_id")
			.notNull()
			.references(() => postsTable.id, { onDelete: "cascade" }),
		body: text("body").notNull(),
		parentCommentId: text("parent_comment_id").references(
			(): AnyPgColumn => commentsTable.id,
			{ onDelete: "cascade" }
		),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("comments_user_id_idx").on(table.authorId),
		index("comments_post_id_idx").on(table.postId),
		index("comments_parent_comment_id_idx").on(table.parentCommentId),
	]
);

export type Comment = InferSelectModel<typeof commentsTable>;
export type NewComment = InferInsertModel<typeof commentsTable>;
