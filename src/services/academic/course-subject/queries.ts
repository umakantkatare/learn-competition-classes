import { and, asc, eq, notExists } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
import { courseSubject } from "@/db/schema/course-subject-schema";
import { subject } from "@/db/schema/subject-schema";

export async function getSubjectsByCourseId(courseId: string) {
  return db
    .select({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      isActive: subject.isActive,
    })
    .from(courseSubject)
    .innerJoin(subject, eq(courseSubject.subjectId, subject.id))
    .where(eq(courseSubject.courseId, courseId))
    .orderBy(asc(subject.name));
}

export async function getAvailableSubjectsForCourse(courseId: string) {
  return db
    .select({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
    })
    .from(subject)
    .where(
      and(
        eq(subject.isActive, true),
        notExists(
          db
            .select({ id: courseSubject.id })
            .from(courseSubject)
            .where(
              and(
                eq(courseSubject.courseId, courseId),
                eq(courseSubject.subjectId, subject.id),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(subject.name));
}

export async function getCoursesBySubjectId(subjectId: string) {
  return db
    .select({
      id: course.id,
      name: course.name,
      slug: course.slug,
      isActive: course.isActive,
    })
    .from(courseSubject)
    .innerJoin(course, eq(courseSubject.courseId, course.id))
    .where(eq(courseSubject.subjectId, subjectId))
    .orderBy(asc(course.name));
}
