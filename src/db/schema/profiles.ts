import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { PROFILE_TYPES } from "@/lib/shared/constants";
import { user } from "./auth-schema";

const profileTypeEnum = pgEnum("profile_type", PROFILE_TYPES);

export const profilesTable = pgTable(
	"profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		displayName: text("display_name").notNull(),
		username: text("username").unique().notNull(),
		type: profileTypeEnum("profile_type").default("public"),
		pronouns: text("pronouns"),
		isGlimpseVerified: boolean("is_glimpse_verified").default(false).notNull(),
		bio: text("bio"),
		website: text("website"),
		avatarUrl: text("avatar_url").default("/static/default-pfp.png").notNull(),
		avatarKey: text("avatar_key"),
		bannerUrl: text("banner_url")
			.default("/static/default-banner.png")
			.notNull(),
		bannerKey: text("banner_key"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("profiles_user_id_idx").on(table.userId),
		index("profiles_username_idx").on(table.username),
	]
);

export type Profile = InferSelectModel<typeof profilesTable>;
export type NewProfile = InferInsertModel<typeof profilesTable>;
