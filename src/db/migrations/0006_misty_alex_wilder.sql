CREATE TYPE "public"."notification_type" AS ENUM('like', 'comment', 'comment_like', 'follow', 'follow_accept', 'system');--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"post_id" text,
	"comment_id" text,
	"group_key" text,
	"actor_ids" text[] DEFAULT '{}' NOT NULL,
	"actor_count" integer DEFAULT 0 NOT NULL,
	"body" text,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_recipient_id_idx" ON "notifications" USING btree ("recipient_id");--> statement-breakpoint
CREATE INDEX "notifications_group_key_idx" ON "notifications" USING btree ("group_key");--> statement-breakpoint
CREATE UNIQUE INDEX "notifications_recipient_group_key_uidx" ON "notifications" USING btree ("recipient_id","group_key") WHERE "notifications"."group_key" IS NOT NULL;