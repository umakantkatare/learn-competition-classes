import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
import { courseSubject } from "@/db/schema/course-subject-schema";
import { subject } from "@/db/schema/subject-schema";

interface AssignSubjectToCourseInput {
  courseId: string;
  subjectId: string;
}

export async function assignSubjectToCourse(input: AssignSubjectToCourseInput) {
  // Confirm both records exist and the subject is active.
  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.id, input.courseId))
    .limit(1);

  if (!existingCourse) {
    throw new Error("Course not found.");
  }

  const [existingSubject] = await db
    .select({
      id: subject.id,
      isActive: subject.isActive,
    })
    .from(subject)
    .where(eq(subject.id, input.subjectId))
    .limit(1);

  if (!existingSubject) {
    throw new Error("Subject not found.");
  }

  if (!existingSubject.isActive) {
    throw new Error("Cannot assign an inactive subject.");
  }

  const [assignment] = await db
    .insert(courseSubject)
    .values({
      id: crypto.randomUUID(),
      courseId: input.courseId,
      subjectId: input.subjectId,
    })
    .onConflictDoNothing({
      target: [courseSubject.courseId, courseSubject.subjectId],
    })
    .returning();

  return assignment ?? null;
}

export async function removeSubjectFromCourse(
  courseId: string,
  subjectId: string,
) {
  const [removedAssignment] = await db
    .delete(courseSubject)
    .where(
      and(
        eq(courseSubject.courseId, courseId),
        eq(courseSubject.subjectId, subjectId),
      ),
    )
    .returning();

  return removedAssignment ?? null;
}
