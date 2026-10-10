import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { course } from "./course-schema";
import { subject } from "./subject-schema";

export const courseSubject = pgTable(
  "course_subject",
  {
    id: text("id").primaryKey(),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
      }),

    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("course_subject_unique_idx").on(
      table.courseId,
      table.subjectId,
    ),

    index("course_subject_course_idx").on(table.courseId),

    index("course_subject_subject_idx").on(table.subjectId),
  ],
);
