CREATE TABLE "exam" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"year" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "exam_slug_year_idx" ON "exam" ("slug","year");--> statement-breakpoint
CREATE INDEX "exam_year_idx" ON "exam" ("year");--> statement-breakpoint
CREATE INDEX "exam_is_active_idx" ON "exam" ("is_active");