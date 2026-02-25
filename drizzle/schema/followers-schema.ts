import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const followersTable = pgTable(
	"followers",
	{
		follower_id: uuid("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		following_id: uuid("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.follower_id, table.following_id] })]
);
