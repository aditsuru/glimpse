import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const profilesTable = pgTable(
	"profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		avatarUrl: text("avatar_url"),
		bannerUrl: text("banner_url"),
		bio: text("bio"),
		website: text("website"),
		isGlimpseVerified: boolean("is_glimpse_verified").default(false).notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("profiles_user_id_idx").on(table.userId)]
);

export type Profile = InferSelectModel<typeof profilesTable>;
export type NewProfile = InferInsertModel<typeof profilesTable>;
