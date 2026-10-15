import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { course } from "./course-schema";
import { user } from "./auth-schema";

export const courseSubjects = pgTable(
  "course_subjects",
  {
    id: text("id").primaryKey(),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
      }),

    teacherId: text("teacher_id").references(() => user.id, {
      onDelete: "set null",
    }),

    name: text("name").notNull(),

    isPublished: boolean("is_published").notNull().default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("course_subjects_course_id_idx").on(table.courseId),

    index("course_subjects_teacher_id_idx").on(table.teacherId),

    uniqueIndex("course_subjects_course_name_idx").on(
      table.courseId,
      table.name,
    ),
  ],
);
