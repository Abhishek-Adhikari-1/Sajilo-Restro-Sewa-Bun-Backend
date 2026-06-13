ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."payment_method";--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'mobile_wallet', 'others');--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."payment_method" USING "method"::"public"."payment_method";