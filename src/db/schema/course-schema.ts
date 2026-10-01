import { defineRelations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Courses
 */
export const course = pgTable(
  "course",
  {
    id: text("id").primaryKey(),

    title: text("title").notNull(),

    slug: text("slug").notNull().unique(),

    description: text("description"),

    thumbnail: text("thumbnail"),

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
    index("course_title_idx").on(table.title),
    index("course_active_idx").on(table.isActive),
  ],
);

/**
 * Course Sections
 */
export const courseSection = pgTable(
  "course_section",
  {
    id: text("id").primaryKey(),

    courseId: text("course_id")
      .notNull()
      .references(() => course.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),

    title: text("title").notNull(),

    description: text("description"),

    /**
     * Determines the section's position
     * inside the course.
     */
    order: integer("order").notNull().default(0),

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
    index("course_section_course_id_idx").on(table.courseId),
    index("course_section_order_idx").on(table.courseId, table.order),
  ],
);

export const courseRelations = defineRelations(
  {
    course,
    courseSection,
  },
  (r) => ({
    course: {
      sections: r.many.courseSection({
        from: r.course.id,
        to: r.courseSection.courseId,
      }),
    },

    courseSection: {
      course: r.one.course({
        from: r.courseSection.courseId,
        to: r.course.id,
      }),
    },
  }),
);
