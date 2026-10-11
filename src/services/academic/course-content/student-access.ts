import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
import { courseContent } from "@/db/schema/course-content-schema";
import { getActiveEnrollment } from "@/services/academic/enrollment/queries";

export async function getStudentCourseContent(
  userId: string,
  courseId: string,
) {
  // Confirm that the course exists and is active.
  const [existingCourse] = await db
    .select({
      id: course.id,
      isActive: course.isActive,
    })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!existingCourse || !existingCourse.isActive) {
    return {
      hasFullAccess: false,
      content: [],
    };
  }

  // Check whether the student has a valid enrollment.
  const activeEnrollment = await getActiveEnrollment(userId, courseId);

  const conditions = [
    eq(courseContent.courseId, courseId),
    eq(courseContent.isPublished, true),
  ];

  // Without enrollment, only published preview videos are accessible.
  if (!activeEnrollment) {
    conditions.push(
      eq(courseContent.type, "VIDEO"),
      eq(courseContent.isPreview, true),
    );
  }

  const content = await db
    .select({
      id: courseContent.id,
      courseId: courseContent.courseId,
      subjectId: courseContent.subjectId,
      topicId: courseContent.topicId,
      title: courseContent.title,
      description: courseContent.description,
      type: courseContent.type,
      thumbnail: courseContent.thumbnail,
      sortOrder: courseContent.sortOrder,
      isPreview: courseContent.isPreview,
    })
    .from(courseContent)
    .where(and(...conditions))
    .orderBy(asc(courseContent.sortOrder), asc(courseContent.createdAt));

  return {
    hasFullAccess: Boolean(activeEnrollment),
    content,
  };
}
