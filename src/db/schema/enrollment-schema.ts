import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "@/db/schema/auth-schema";
import { course } from "@/db/schema/course-schema";

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
]);

export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id").primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),

    status: enrollmentStatusEnum("status").notNull().default("ACTIVE"),

    enrolledAt: timestamp("enrolled_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),

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
    index("enrollment_user_id_idx").on(table.userId),
    index("enrollment_course_id_idx").on(table.courseId),
    index("enrollment_status_idx").on(table.status),
    uniqueIndex("enrollment_user_course_idx").on(table.userId, table.courseId),
  ],
);
