ALTER TYPE "public"."profile_type" RENAME TO "visibility";--> statement-breakpoint
ALTER TABLE "profiles" RENAME COLUMN "profile_type" TO "visibility";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "visibility" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "visibility" SET DEFAULT 'public'::text;--> statement-breakpoint
DROP TYPE "public"."visibility";--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "visibility" SET DEFAULT 'public'::"public"."visibility";--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "visibility" SET DATA TYPE "public"."visibility" USING "visibility"::"public"."visibility";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "website";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "avatar_url";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "banner_url";