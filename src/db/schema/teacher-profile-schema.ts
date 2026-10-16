import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { user } from "./auth-schema";

export const teacherProfiles = pgTable(
  "teacher_profiles",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),

    bio: text("bio"),
    qualification: text("qualification"),

    experienceYears: integer("experience_years").notNull().default(0),

    specializations: jsonb("specializations")
      .$type<string[]>()
      .notNull()
      .default([]),

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
    check(
      "teacher_profiles_experience_nonnegative",
      sql`${table.experienceYears} >= 0`,
    ),
  ],
);
