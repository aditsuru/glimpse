import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const StatusEnum = pgEnum("status", ["pending", "accepted"]);
export type StatusEnumType = (typeof StatusEnum.enumValues)[number];

export const followsTable = pgTable(
	"follows",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: StatusEnum("status").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("follows_follower_id_idx").on(table.followerId),
		index("follows_following_id_idx").on(table.followingId),
	]
);

export type Follow = InferSelectModel<typeof followsTable>;
export type NewFollow = InferInsertModel<typeof followsTable>;
