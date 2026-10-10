import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { courseContent } from "@/db/schema/course-content-schema";

/**
 * Get all content belonging to a course.
 * Used by the academic dashboard.
 */
export async function getCourseContentByCourseId(courseId: string) {
  return db
    .select()
    .from(courseContent)
    .where(eq(courseContent.courseId, courseId))
    .orderBy(asc(courseContent.sortOrder), asc(courseContent.createdAt));
}

/**
 * Get one content item by its ID.
 */
export async function getCourseContentById(contentId: string) {
  const [content] = await db
    .select()
    .from(courseContent)
    .where(eq(courseContent.id, contentId))
    .limit(1);

  return content ?? null;
}

/**
 * Get published content for a public course page.
 */
export async function getPublishedCourseContentByCourseId(courseId: string) {
  return db
    .select()
    .from(courseContent)
    .where(eq(courseContent.courseId, courseId))
    .orderBy(asc(courseContent.sortOrder), asc(courseContent.createdAt));
}
