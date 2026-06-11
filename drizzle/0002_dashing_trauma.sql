ALTER TYPE "public"."table_status" ADD VALUE 'unavailable';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "subtotal" integer NOT NULL;