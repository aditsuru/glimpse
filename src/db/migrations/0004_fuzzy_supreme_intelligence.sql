DROP INDEX "comments_post_id_idx";--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");