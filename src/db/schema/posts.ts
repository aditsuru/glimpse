import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { user } from "./auth-schema";

export const postsTable = pgTable(
	"posts",
	{
		id: text("id")
			.$defaultFn(() => nanoid(10))
			.primaryKey(),
		authorId: text("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body"),
		hasAttachments: boolean("has_attachments").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("posts_user_id_idx").on(table.authorId)]
);

export type Post = InferSelectModel<typeof postsTable>;
export type NewPost = InferInsertModel<typeof postsTable>;
