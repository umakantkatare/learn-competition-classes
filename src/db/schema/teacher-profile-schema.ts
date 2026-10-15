import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const teacherProfiles = pgTable("teacher_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  avatar: text("avatar"),
  bio: text("bio"),
  qualification: text("qualification"),
  experienceYears: integer("experience_years"),

  specializations: jsonb("specializations")
    .$type<string[]>()
    .notNull()
    .default([]),

  languages: jsonb("languages").$type<string[]>().notNull().default([]),

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
});
