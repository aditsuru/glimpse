import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { commentsTable } from "./comments-schema";

export const commentLikesTable = pgTable(
	"comment_likes",
	{
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		commentId: uuid("comment_id")
			.notNull()
			.references(() => commentsTable.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.userId, table.commentId] })]
);
