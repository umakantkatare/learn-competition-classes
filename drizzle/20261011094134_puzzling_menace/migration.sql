CREATE TYPE "enrollment_status" AS ENUM('ACTIVE', 'EXPIRED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"status" "enrollment_status" DEFAULT 'ACTIVE'::"enrollment_status" NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enrollment_user_id_idx" ON "enrollment" ("user_id");--> statement-breakpoint
CREATE INDEX "enrollment_course_id_idx" ON "enrollment" ("course_id");--> statement-breakpoint
CREATE INDEX "enrollment_status_idx" ON "enrollment" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "enrollment_user_course_idx" ON "enrollment" ("user_id","course_id");--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;