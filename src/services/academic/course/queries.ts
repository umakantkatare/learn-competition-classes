import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";

export async function getCourses() {
  return db
    .select()
    .from(course)
    .orderBy(desc(course.createdAt), asc(course.name));
}

export async function getCourseById(id: string) {
  const [result] = await db
    .select()
    .from(course)
    .where(eq(course.id, id))
    .limit(1);

  return result ?? null;
}

export async function getCourseBySlug(slug: string) {
  const [result] = await db
    .select()
    .from(course)
    .where(eq(course.slug, slug))
    .limit(1);

  return result ?? null;
}

export async function getActiveCourses() {
  return db
    .select()
    .from(course)
    .where(eq(course.isActive, true))
    .orderBy(asc(course.name));
}
