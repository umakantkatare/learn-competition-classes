CREATE TABLE "course" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"thumbnail" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_section" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "course_title_idx" ON "course" ("title");--> statement-breakpoint
CREATE INDEX "course_active_idx" ON "course" ("is_active");--> statement-breakpoint
CREATE INDEX "course_section_course_id_idx" ON "course_section" ("course_id");--> statement-breakpoint
CREATE INDEX "course_section_order_idx" ON "course_section" ("course_id","order");--> statement-breakpoint
ALTER TABLE "course_section" ADD CONSTRAINT "course_section_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;