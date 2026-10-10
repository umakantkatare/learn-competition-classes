import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { course } from "./course-schema";
import { subject } from "./subject-schema";
import { topic } from "./topic-schema";

export const courseContentType = pgEnum("course_content_type", [
  "VIDEO",
  "PDF",
  "TEST",
]);

export const courseContent = pgTable(
  "course_content",
  {
    id: text("id").primaryKey(),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
      }),

    subjectId: text("subject_id").references(() => subject.id, {
      onDelete: "set null",
    }),

    topicId: text("topic_id").references(() => topic.id, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),

    description: text("description"),

    type: courseContentType("type").notNull(),

    videoId: text("video_id"),

    fileUrl: text("file_url"),

    thumbnail: text("thumbnail"),

    sortOrder: integer("sort_order").notNull().default(0),

    isPublished: boolean("is_published").notNull().default(false),

    isPreview: boolean("is_preview").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("course_content_course_idx").on(table.courseId),

    index("course_content_subject_idx").on(table.subjectId),

    index("course_content_topic_idx").on(table.topicId),

    index("course_content_type_idx").on(table.type),

    index("course_content_published_idx").on(table.isPublished),

    uniqueIndex("course_content_course_order_idx").on(
      table.courseId,
      table.sortOrder,
    ),
  ],
);
