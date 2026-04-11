import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	index,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { FOLLOW_REQUEST_STATUS } from "@/lib/shared/constants";
import { user } from "./auth-schema";

const followRequestStatusEnum = pgEnum(
	"follow_request_status",
	FOLLOW_REQUEST_STATUS
);

export const followsTable = pgTable(
	"follows",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		status: followRequestStatusEnum("status").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("followers_follower_id_idx").on(table.followerId),
		index("followers_following_id_idx").on(table.followingId),
	]
);

export type Follow = InferSelectModel<typeof followsTable>;
export type NewFollow = InferInsertModel<typeof followsTable>;
