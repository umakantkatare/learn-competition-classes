import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const course = pgTable(
  "course",
  {
    id: text("id").primaryKey(),

    name: text("name").notNull(),

    slug: text("slug").notNull(),

    description: text("description"),

    thumbnail: text("thumbnail"),

    features: jsonb("features").$type<string[]>().notNull().default([]),

    price: integer("price").notNull(),

    salePrice: integer("sale_price"),

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
    uniqueIndex("course_slug_idx").on(table.slug),

    index("course_is_active_idx").on(table.isActive),
  ],
);
