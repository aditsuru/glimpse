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
import { user } from "./auth-schema";

export const VisibilityEnum = pgEnum("visibility", ["public", "private"]);
export type VisibilityEnumType = (typeof VisibilityEnum.enumValues)[number];

export const profilesTable = pgTable(
	"profiles",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		displayName: text("display_name").notNull(),
		username: text("username").unique().notNull(),
		visibility: VisibilityEnum("visibility").default("public").notNull(),
		pronouns: text("pronouns"),
		isGlimpseVerified: boolean("is_glimpse_verified").default(false).notNull(),
		bio: text("bio"),
		avatarKey: text("avatar_key"),
		bannerKey: text("banner_key"),
		bannerMimeType: text("banner_mime_type"),
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
