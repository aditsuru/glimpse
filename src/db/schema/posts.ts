import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import { user } from "./auth-schema";

export const postsTable = pgTable(
	"posts",
	{
		id: text("id")
			.$defaultFn(() => nanoid())
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		body: text("body"),
		views: integer("views").default(0).notNull(),
		hasAttachments: boolean("has_attachments").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("posts_user_id_idx").on(table.userId)]
);

export type Post = InferSelectModel<typeof postsTable>;
export type NewPost = InferInsertModel<typeof postsTable>;

export const postSelectSchema = createSelectSchema(postsTable);
