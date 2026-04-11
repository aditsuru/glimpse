import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const blocksTable = pgTable(
	"blocks",
	{
		blockerId: text("blocker_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blockedId: text("blocked_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.blockerId, table.blockedId] }),
		index("blockers_blocker_id_idx").on(table.blockerId),
		index("blockers_blocked_id_idx").on(table.blockedId),
	]
);

export type Block = InferSelectModel<typeof blocksTable>;
export type NewBlock = InferInsertModel<typeof blocksTable>;
