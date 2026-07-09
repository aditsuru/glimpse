import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { customNanoid } from "@/lib/server/helpers";
import { user } from "./auth-schema";

export const bansTable = pgTable(
	"bans",
	{
		id: text("id")
			.$defaultFn(() => customNanoid())
			.primaryKey()
			.notNull(),

		userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

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
	},
	(table) => [uniqueIndex("bans_email_uidx").on(table.email)]
);

export type Ban = InferSelectModel<typeof bansTable>;
export type NewBan = InferInsertModel<typeof bansTable>;
export const banSelectSchema = createSelectSchema(bansTable);
