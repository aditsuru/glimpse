import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { customNanoid } from "@/lib/server/helpers";

export const DmcaStatusEnum = pgEnum("dmca_status", [
	"pending",
	"reviewed",
	"actioned",
	"rejected",
]);

export const dmcaRequestsTable = pgTable("dmca_requests", {
	id: text("id")
		.$defaultFn(() => customNanoid())
		.primaryKey()
		.notNull(),

	fullName: text("full_name").notNull(),
	email: text("email").notNull(),
	address: text("address").notNull(),
	phone: text("phone"),

	copyrightedWorkDescription: text("copyrighted_work_description").notNull(),
	infringingUrl: text("infringing_url").notNull(),
	additionalContext: text("additional_context"),

	goodFaithStatement: boolean("good_faith_statement").notNull(),
	perjuryStatement: boolean("perjury_statement").notNull(),
	signature: text("signature").notNull(),

	status: DmcaStatusEnum("status").notNull().default("pending"),
	adminNotes: text("admin_notes"),

	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export type DmcaRequest = InferSelectModel<typeof dmcaRequestsTable>;
export type NewDmcaRequest = InferInsertModel<typeof dmcaRequestsTable>;
export const dmcaRequestSelectSchema = createSelectSchema(dmcaRequestsTable);
