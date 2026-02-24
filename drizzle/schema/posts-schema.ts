import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const posts = pgTable(
	"posts",
	{
		id: uuid().defaultRandom().primaryKey(),
		title: varchar("title", { length: 256 }).notNull(),
		body: text("body"),
		mimeType: varchar("mime_type", { length: 50 }),
		fileUrl: text("file_url"),
		authorId: uuid("author_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("post_author_idx").on(table.authorId),
		index("post_created_idx").on(table.createdAt),
	]
);

export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
