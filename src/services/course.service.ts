import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { course, courseSection } from "@/db/schema/course-schema";

import type {
  CourseCreateInput,
  CourseSectionCreateInput,
  CourseSectionUpdateInput,
  CourseUpdateInput,
} from "@/validations/course/course";

export async function createCourse(data: CourseCreateInput) {
  const [newCourse] = await db
    .insert(course)
    .values({
      id: crypto.randomUUID(),
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      thumbnail: data.thumbnail || null,
      isActive: data.isActive,
    })
    .returning();

  return newCourse;
}

export async function getCourses() {
  return db.select().from(course).orderBy(desc(course.createdAt));
}

export async function getActiveCourses() {
  return db
    .select()
    .from(course)
    .where(eq(course.isActive, true))
    .orderBy(desc(course.createdAt));
}

export async function getCourseById(courseId: string) {
  const [result] = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
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

export async function updateCourse(courseId: string, data: CourseUpdateInput) {
  const [updatedCourse] = await db
    .update(course)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(course.id, courseId))
    .returning();

  return updatedCourse ?? null;
}

export async function toggleCourseStatus(courseId: string) {
  const existingCourse = await getCourseById(courseId);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  const [updatedCourse] = await db
    .update(course)
    .set({
      isActive: !existingCourse.isActive,
      updatedAt: new Date(),
    })
    .where(eq(course.id, courseId))
    .returning();

  return updatedCourse;
}

export async function deleteCourse(courseId: string) {
  const [deletedCourse] = await db
    .delete(course)
    .where(eq(course.id, courseId))
    .returning();

  return deletedCourse ?? null;
}

export async function createCourseSection(data: CourseSectionCreateInput) {
  const parentCourse = await getCourseById(data.courseId);

  if (!parentCourse) {
    throw new Error("Course not found");
  }

  const [newSection] = await db
    .insert(courseSection)
    .values({
      id: crypto.randomUUID(),
      courseId: data.courseId,
      title: data.title,
      description: data.description || null,
      order: data.order,
      isActive: data.isActive,
    })
    .returning();

  return newSection;
}

export async function getCourseSections(courseId: string) {
  return db
    .select()
    .from(courseSection)
    .where(eq(courseSection.courseId, courseId))
    .orderBy(asc(courseSection.order));
}

export async function getCourseSectionById(sectionId: string) {
  const [result] = await db
    .select()
    .from(courseSection)
    .where(eq(courseSection.id, sectionId))
    .limit(1);

  return result ?? null;
}

export async function updateCourseSection(
  sectionId: string,
  data: CourseSectionUpdateInput,
) {
  const [updatedSection] = await db
    .update(courseSection)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(courseSection.id, sectionId))
    .returning();

  return updatedSection ?? null;
}

export async function deleteCourseSection(sectionId: string) {
  const [deletedSection] = await db
    .delete(courseSection)
    .where(eq(courseSection.id, sectionId))
    .returning();

  return deletedSection ?? null;
}
