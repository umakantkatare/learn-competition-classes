CREATE TYPE "course_content_type" AS ENUM('VIDEO', 'PDF', 'TEST');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'student',
	"phone_number" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_content" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"subject_id" text,
	"topic_id" text,
	"title" text NOT NULL,
	"description" text,
	"type" "course_content_type" NOT NULL,
	"video_id" text,
	"file_url" text,
	"thumbnail" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"features" jsonb DEFAULT '[]' NOT NULL,
	"price" integer NOT NULL,
	"sale_price" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_subject" (
	"id" text PRIMARY KEY,
	"course_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
CREATE TABLE "topic" (
	"id" text PRIMARY KEY,
	"subject_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
CREATE INDEX "course_content_course_idx" ON "course_content" ("course_id");--> statement-breakpoint
CREATE INDEX "course_content_subject_idx" ON "course_content" ("subject_id");--> statement-breakpoint
CREATE INDEX "course_content_topic_idx" ON "course_content" ("topic_id");--> statement-breakpoint
CREATE INDEX "course_content_type_idx" ON "course_content" ("type");--> statement-breakpoint
CREATE INDEX "course_content_published_idx" ON "course_content" ("is_published");--> statement-breakpoint
CREATE UNIQUE INDEX "course_content_course_order_idx" ON "course_content" ("course_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "course_slug_idx" ON "course" ("slug");--> statement-breakpoint
CREATE INDEX "course_is_active_idx" ON "course" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "course_subject_unique_idx" ON "course_subject" ("course_id","subject_id");--> statement-breakpoint
CREATE INDEX "course_subject_course_idx" ON "course_subject" ("course_id");--> statement-breakpoint
CREATE INDEX "course_subject_subject_idx" ON "course_subject" ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_slug_year_idx" ON "exam" ("slug","year");--> statement-breakpoint
CREATE INDEX "exam_year_idx" ON "exam" ("year");--> statement-breakpoint
CREATE INDEX "exam_is_active_idx" ON "exam" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_subject_unique_idx" ON "exam_subject" ("exam_id","subject_id");--> statement-breakpoint
CREATE INDEX "exam_subject_exam_idx" ON "exam_subject" ("exam_id");--> statement-breakpoint
CREATE INDEX "exam_subject_subject_idx" ON "exam_subject" ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subject_slug_idx" ON "subject" ("slug");--> statement-breakpoint
CREATE INDEX "subject_is_active_idx" ON "subject" ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_subject_slug_idx" ON "topic" ("subject_id","slug");--> statement-breakpoint
CREATE INDEX "topic_subject_idx" ON "topic" ("subject_id");--> statement-breakpoint
CREATE INDEX "topic_is_active_idx" ON "topic" ("is_active");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_content" ADD CONSTRAINT "course_content_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_content" ADD CONSTRAINT "course_content_subject_id_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "course_content" ADD CONSTRAINT "course_content_topic_id_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topic"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "course_subject" ADD CONSTRAINT "course_subject_course_id_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "course_subject" ADD CONSTRAINT "course_subject_subject_id_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_exam_id_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exam"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "exam_subject" ADD CONSTRAINT "exam_subject_subject_id_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "topic" ADD CONSTRAINT "topic_subject_id_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("id") ON DELETE CASCADE;