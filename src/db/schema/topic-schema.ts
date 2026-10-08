import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { subject } from "./subject-schema";

export const topic = pgTable(
  "topic",
  {
    id: text("id").primaryKey(),

    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    isActive: boolean("is_active").notNull().default(true),

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
    uniqueIndex("topic_subject_slug_idx").on(table.subjectId, table.slug),

    index("topic_subject_idx").on(table.subjectId),

    index("topic_is_active_idx").on(table.isActive),
  ],
);
