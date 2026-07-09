CREATE TYPE "public"."dmca_status" AS ENUM('pending', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TABLE "dmca_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"address" text NOT NULL,
	"phone" text,
	"copyrighted_work_description" text NOT NULL,
	"infringing_url" text NOT NULL,
	"additional_context" text,
	"good_faith_statement" boolean NOT NULL,
	"perjury_statement" boolean NOT NULL,
	"signature" text NOT NULL,
	"status" "dmca_status" DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
