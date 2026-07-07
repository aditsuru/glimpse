CREATE TYPE "public"."report_reason" AS ENUM('spam', 'nsfw', 'harassment', 'hate_speech', 'self_harm', 'misinformation', 'copyright', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'actioned', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('post', 'comment', 'user');--> statement-breakpoint
CREATE TABLE "bans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"reason" text NOT NULL,
	"banned_by" text NOT NULL,
	"expires_at" timestamp with time zone,
	"is_permanent" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bans_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_post_id" text,
	"target_comment_id" text,
	"target_user_id" text,
	"reason" "report_reason" NOT NULL,
	"body" text,
	"status" "report_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bans" ADD CONSTRAINT "bans_banned_by_user_id_fk" FOREIGN KEY ("banned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_post_id_posts_id_fk" FOREIGN KEY ("target_post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_comment_id_comments_id_fk" FOREIGN KEY ("target_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reports_reporter_id_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_target_post_id_idx" ON "reports" USING btree ("target_post_id");--> statement-breakpoint
CREATE INDEX "reports_target_comment_id_idx" ON "reports" USING btree ("target_comment_id");--> statement-breakpoint
CREATE INDEX "reports_target_user_id_idx" ON "reports" USING btree ("target_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reports_reporter_post_uidx" ON "reports" USING btree ("reporter_id","target_post_id") WHERE "reports"."target_post_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "reports_reporter_comment_uidx" ON "reports" USING btree ("reporter_id","target_comment_id") WHERE "reports"."target_comment_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "reports_reporter_user_uidx" ON "reports" USING btree ("reporter_id","target_user_id") WHERE "reports"."target_user_id" IS NOT NULL;