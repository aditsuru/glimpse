DROP INDEX "notifications_recipient_group_key_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_recipient_group_key_uidx" ON "notifications" USING btree ("recipient_id","group_key");