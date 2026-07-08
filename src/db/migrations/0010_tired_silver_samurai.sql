ALTER TABLE "bans" DROP CONSTRAINT "bans_user_id_unique";--> statement-breakpoint
ALTER TABLE "bans" DROP CONSTRAINT "bans_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bans" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bans_email_uidx" ON "bans" USING btree ("email");