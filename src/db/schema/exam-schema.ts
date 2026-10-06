import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const exam = pgTable(
  "exam",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    year: integer("year").notNull(),

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
    uniqueIndex("exam_slug_year_idx").on(table.slug, table.year),

    index("exam_year_idx").on(table.year),

    index("exam_is_active_idx").on(table.isActive),
  ],
);
