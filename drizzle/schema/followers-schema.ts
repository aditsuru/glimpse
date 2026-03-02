import { pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const followersTable = pgTable(
	"followers",
	{
		follower_id: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		following_id: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.follower_id, table.following_id] })]
);
