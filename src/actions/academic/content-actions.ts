"use server";

import { revalidatePath } from "next/cache";

import { requireAcademicWriteAccess } from "@/lib/authorization/academic";
import {
  createCourseContent,
  updateCourseContent,
} from "@/services/academic/course-content/mutations";
import {
  createCourseContentSchema,
  updateCourseContentSchema,
} from "@/validations/academic/course-content-validation";

export async function createCourseContentAction(input: unknown) {
  try {
    await requireAcademicWriteAccess();

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

    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create course content",
    };
  }
}

export async function updateCourseContentAction(
  contentId: string,
  input: unknown,
) {
  try {
    await requireAcademicWriteAccess();

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

    return {
      success: false as const,
      error:
        error instanceof Error && error.message === "Course content not found"
          ? error.message
          : "Failed to update course content",
    };
  }
}
