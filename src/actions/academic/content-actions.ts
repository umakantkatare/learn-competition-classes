"use server";

import { revalidatePath } from "next/cache";

import { requireAcademicAccess } from "@/lib/authorization/academic";
import {
  createCourseContent,
  deleteCourseContent,
  updateCourseContent,
} from "@/services/academic/course-content/mutations";
import {
  createCourseContentSchema,
  updateCourseContentSchema,
} from "@/validations/academic/course-content-validation";

const knownErrors = [
  "Course content not found",
  "Subject is not assigned to this course",
  "Topic does not belong to the selected subject",
  "A subject is required when selecting a topic",
  "Unauthorized",
  "Forbidden",
];

export async function createCourseContentAction(input: unknown) {
  try {
    await requireAcademicAccess();

    const parsed = createCourseContentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid content data",
      };
    }

    const content = await createCourseContent(parsed.data);

    revalidatePath(`/academic/courses/${content.courseId}`);
    revalidatePath(`/academic/courses/${content.courseId}/content/create`);

    return {
      success: true as const,
      data: content,
    };
  } catch (error) {
    console.error("Create course content failed:", error);

    const message = error instanceof Error ? error.message : "";

    return {
      success: false as const,
      error: knownErrors.includes(message)
        ? message
        : "Failed to create course content",
    };
  }
}

export async function updateCourseContentAction(
  contentId: string,
  input: unknown,
) {
  try {
    await requireAcademicAccess();

    if (!contentId?.trim()) {
      return {
        success: false as const,
        error: "Content ID is required",
      };
    }

    const parsed = updateCourseContentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid course content data",
      };
    }

    const content = await updateCourseContent(contentId, parsed.data);

    revalidatePath(`/academic/courses/${content.courseId}`);
    revalidatePath(
      `/academic/courses/${content.courseId}/content/${content.id}/edit`,
    );

    return {
      success: true as const,
      data: content,
    };
  } catch (error) {
    console.error("Update course content failed:", error);

    const message = error instanceof Error ? error.message : "";

    return {
      success: false as const,
      error: knownErrors.includes(message)
        ? message
        : "Failed to update course content",
    };
  }
}

export async function deleteCourseContentAction(
  courseId: string,
  contentId: string,
) {
  try {
    await requireAcademicAccess();

    if (!courseId.trim() || !contentId.trim()) {
      return {
        success: false as const,
        error: "Course ID and content ID are required",
      };
    }

    const deletedContent = await deleteCourseContent(courseId, contentId);

    revalidatePath(`/academic/courses/${courseId}`);
    revalidatePath(`/academic/courses/${courseId}/content/${contentId}/edit`);

    return {
      success: true as const,
      data: deletedContent,
    };
  } catch (error) {
    console.error("Delete course content failed:", error);

    const message = error instanceof Error ? error.message : "";

    return {
      success: false as const,
      error: knownErrors.includes(message)
        ? message
        : "Failed to delete course content",
    };
  }
}
