"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  assignSubjectToCourse,
  removeSubjectFromCourse,
} from "@/services/academic/course-subject/mutations";
import { requireAcademicWriteAccess } from "@/lib/authorization/academic";
import { deleteCourseContent } from "@/services/academic/course-content/mutations";

const assignmentSchema = z.object({
  courseId: z.string().trim().min(1, "Course ID is required."),
  subjectId: z.string().trim().min(1, "Subject ID is required."),
});

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (
      error.message === "Course not found." ||
      error.message === "Subject not found." ||
      error.message === "Cannot assign an inactive subject."
    ) {
      return error.message;
    }
  }

  return "Something went wrong. Please try again.";
}

export async function assignSubjectToCourseAction(input: unknown) {
  try {
    await requireAcademicWriteAccess();

    const parsed = assignmentSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid assignment.",
      };
    }

    const assignment = await assignSubjectToCourse(parsed.data);

    revalidatePath(`/academic/courses/${parsed.data.courseId}`);
    revalidatePath("/academic/courses");
    revalidatePath(`/academic/subjects/${parsed.data.subjectId}`);

    return {
      success: true as const,
      data: assignment,
      message: assignment
        ? "Subject assigned successfully."
        : "Subject is already assigned to this course.",
    };
  } catch (error) {
    console.error("Assign subject to course error:", error);

    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}

export async function removeSubjectFromCourseAction(
  courseId: string,
  subjectId: string,
) {
  try {
    await requireAcademicWriteAccess();

    const parsed = assignmentSchema.safeParse({ courseId, subjectId });

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid assignment.",
      };
    }

    const removed = await removeSubjectFromCourse(
      parsed.data.courseId,
      parsed.data.subjectId,
    );

    if (!removed) {
      return {
        success: false as const,
        error: "Subject assignment not found.",
      };
    }

    revalidatePath(`/academic/courses/${parsed.data.courseId}`);
    revalidatePath("/academic/courses");
    revalidatePath(`/academic/subjects/${parsed.data.subjectId}`);

    return {
      success: true as const,
      message: "Subject removed from course.",
    };
  } catch (error) {
    console.error("Remove subject from course error:", error);

    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteCourseContentAction(
  courseId: string,
  contentId: string,
) {
  try {
    await requireAcademicWriteAccess();

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

    return {
      success: false as const,
      error:
        error instanceof Error && error.message === "Course content not found"
          ? error.message
          : "Failed to delete course content",
    };
  }
}
