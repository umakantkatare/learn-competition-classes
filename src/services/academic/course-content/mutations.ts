import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
import { courseContent } from "@/db/schema/course-content-schema";
import { courseSubject } from "@/db/schema/course-subject-schema";
import { topic } from "@/db/schema/topic-schema";

import {
  createCourseContentSchema,
  updateCourseContentSchema,
} from "@/validations/academic/course-content-validation";

import type {
  UpdateCourseContentInput,
  CreateCourseContentInput,
} from "@/validations/academic/course-content-validation";

async function validateContentRelationships(input: {
  courseId: string;
  subjectId: string | null;
  topicId: string | null;
}) {
  if (input.subjectId) {
    const [courseSubjectMatch] = await db
      .select({ courseId: courseSubject.courseId })
      .from(courseSubject)
      .where(
        and(
          eq(courseSubject.courseId, input.courseId),
          eq(courseSubject.subjectId, input.subjectId),
        ),
      )
      .limit(1);

    if (!courseSubjectMatch) {
      throw new Error("Subject is not assigned to this course");
    }
  }

  if (input.topicId) {
    if (!input.subjectId) {
      throw new Error("A subject is required when selecting a topic");
    }

    const [topicMatch] = await db
      .select({ id: topic.id })
      .from(topic)
      .where(
        and(eq(topic.id, input.topicId), eq(topic.subjectId, input.subjectId)),
      )
      .limit(1);

    if (!topicMatch) {
      throw new Error("Topic does not belong to the selected subject");
    }
  }
}

export async function createCourseContent(input: CreateCourseContentInput) {
  const parsed = createCourseContentSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid course content data",
    );
  }

  const data = parsed.data;

  // 1. Verify that the course exists.
  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.id, data.courseId))
    .limit(1);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  await validateContentRelationships({
    courseId: data.courseId,
    subjectId: data.subjectId,
    topicId: data.topicId,
  });

  // 4. Insert the content record.
  const [createdContent] = await db
    .insert(courseContent)
    .values({
      id: crypto.randomUUID(),
      courseId: data.courseId,
      title: data.title,
      description: data.description,
      type: data.type,
      videoId: data.type === "VIDEO" ? data.videoId : null,
      fileUrl: data.type === "PDF" ? data.fileUrl : null,
      thumbnail: data.thumbnail,
      subjectId: data.subjectId,
      topicId: data.topicId,
      sortOrder: data.sortOrder,
      isPublished: data.isPublished,
      isPreview: data.type === "VIDEO" && data.isPreview,
    })
    .returning();

  return createdContent;
}

export async function updateCourseContent(
  contentId: string,
  input: UpdateCourseContentInput,
) {
  const parsed = updateCourseContentSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid course content data",
    );
  }

  if (!contentId.trim()) {
    throw new Error("Content ID is required");
  }

  const data = parsed.data;

  // Verify that the content exists in the specified course.
  const [existingContent] = await db
    .select({
      id: courseContent.id,
      courseId: courseContent.courseId,
    })
    .from(courseContent)
    .where(
      and(
        eq(courseContent.id, contentId),
        eq(courseContent.courseId, data.courseId),
      ),
    )
    .limit(1);

  if (!existingContent) {
    throw new Error("Course content not found");
  }

  await validateContentRelationships({
    courseId: data.courseId,
    subjectId: data.subjectId,
    topicId: data.topicId,
  });

  const [updatedContent] = await db
    .update(courseContent)
    .set({
      title: data.title,
      description: data.description,
      type: data.type,
      videoId: data.type === "VIDEO" ? data.videoId : null,
      fileUrl: data.type === "PDF" ? data.fileUrl : null,
      thumbnail: data.thumbnail,
      subjectId: data.subjectId,
      topicId: data.topicId,
      sortOrder: data.sortOrder,
      isPublished: data.isPublished,
      isPreview: data.type === "VIDEO" && data.isPreview,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(courseContent.id, contentId),
        eq(courseContent.courseId, data.courseId),
      ),
    )
    .returning();

  return updatedContent;
}

export async function deleteCourseContent(courseId: string, contentId: string) {
  const [deletedContent] = await db
    .delete(courseContent)
    .where(
      and(
        eq(courseContent.id, contentId),
        eq(courseContent.courseId, courseId),
      ),
    )
    .returning({
      id: courseContent.id,
      courseId: courseContent.courseId,
      title: courseContent.title,
    });

  if (!deletedContent) {
    throw new Error("Course content not found");
  }

  return deletedContent;
}
