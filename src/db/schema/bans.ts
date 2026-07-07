import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { customNanoid } from "@/lib/server/helpers";
import { user } from "./auth-schema";

export const bansTable = pgTable("bans", {
	id: text("id")
		.$defaultFn(() => customNanoid())
		.primaryKey()
		.notNull(),

	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }),

	email: text("email").notNull(),

	reason: text("reason").notNull(),
	bannedBy: text("banned_by")
		.notNull()
		.references(() => user.id),

	expiresAt: timestamp("expires_at", { withTimezone: true }),
	isPermanent: boolean("is_permanent").notNull().default(true),

	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export type Ban = InferSelectModel<typeof bansTable>;
export type NewBan = InferInsertModel<typeof bansTable>;
export const banSelectSchema = createSelectSchema(bansTable);
