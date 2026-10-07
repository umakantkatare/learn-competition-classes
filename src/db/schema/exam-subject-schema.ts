import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { exam } from "./exam-schema";
import { subject } from "./subject-schema";

export const examSubject = pgTable(
  "exam_subject",
  {
    id: text("id").primaryKey(),

    examId: text("exam_id")
      .notNull()
      .references(() => exam.id, {
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
    uniqueIndex("exam_subject_unique_idx").on(table.examId, table.subjectId),

    index("exam_subject_exam_idx").on(table.examId),

    index("exam_subject_subject_idx").on(table.subjectId),
  ],
);
