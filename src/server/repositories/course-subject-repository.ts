import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";

import { db } from "@/db";
import { courseSubjects } from "@/db/schema/course-subject-schema";

import type {
  CreateCourseSubjectInput,
  UpdateCourseSubjectInput,
} from "@/validations/courses/course-subject-schema";

export async function findSubjectsByCourseId(courseId: string) {
  return db
    .select()
    .from(courseSubjects)
    .where(eq(courseSubjects.courseId, courseId));
}

export async function findPublishedSubjectsByCourseId(courseId: string) {
  return db
    .select()
    .from(courseSubjects)
    .where(
      and(
        eq(courseSubjects.courseId, courseId),
        eq(courseSubjects.isPublished, true),
      ),
    );
}

export async function findSubjectById(id: string) {
  const [subject] = await db
    .select()
    .from(courseSubjects)
    .where(eq(courseSubjects.id, id))
    .limit(1);

  return subject ?? null;
}

export async function findSubjectByName(
  courseId: string,
  name: string,
  excludeId?: string,
) {
  const conditions = [
    eq(courseSubjects.courseId, courseId),
    eq(courseSubjects.name, name),
  ];

  if (excludeId) {
    conditions.push(ne(courseSubjects.id, excludeId));
  }

  const [subject] = await db
    .select()
    .from(courseSubjects)
    .where(and(...conditions))
    .limit(1);

  return subject ?? null;
}

export async function insertCourseSubject(data: CreateCourseSubjectInput) {
  const [subject] = await db
    .insert(courseSubjects)
    .values({
      ...data,
      id: crypto.randomUUID(),
    })
    .returning();

  return subject;
}

export async function updateCourseSubjectById(
  id: string,
  data: UpdateCourseSubjectInput,
) {
  const [subject] = await db
    .update(courseSubjects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(courseSubjects.id, id))
    .returning();

  return subject ?? null;
}

export async function deleteCourseSubjectById(id: string) {
  const [subject] = await db
    .delete(courseSubjects)
    .where(eq(courseSubjects.id, id))
    .returning();

  return subject ?? null;
}
