CREATE TABLE "exam_subject" (
	"id" text PRIMARY KEY,
	"exam_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "exam_subject_unique_idx" ON "exam_subject" ("exam_id","subject_id");--> statement-breakpoint
CREATE INDEX "exam_subject_exam_idx" ON "exam_subject" ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_subject_subject_idx" ON "exam_subject" ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subject_slug_idx" ON "subject" ("slug");--> statement-breakpoint
CREATE INDEX "subject_is_active_idx" ON "subject" ("is_active");--> statement-breakpoint
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_subject_id_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE;