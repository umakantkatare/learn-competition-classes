"use server";

import { revalidatePath } from "next/cache";

import {
  createCourse,
  updateCourse,
  setCourseStatus,
} from "@/services/academic/course/mutations";

import {
  createCourseSchema,
  updateCourseSchema,
} from "@/validations/academic/course/course-validation";
import { requireAcademicWriteAccess } from "@/lib/authorization/academic";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  ) {
    return "A course with this slug already exists.";
  }

  return "Something went wrong. Please try again.";
}

export async function createCourseAction(input: unknown) {
  try {
    await requireAcademicWriteAccess();

    const parsed = createCourseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid course data.",
      };
    }

    const newCourse = await createCourse(parsed.data);

    revalidatePath("/academic/courses");

    return {
      success: true as const,
      data: newCourse,
    };
  } catch (error) {
    console.error("Create course error:", error);

    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}

export async function updateCourseAction(id: string, input: unknown) {
  try {
    await requireAcademicWriteAccess();

    if (!id.trim()) {
      return {
        success: false as const,
        error: "Course ID is required.",
      };
    }

    const parsed = updateCourseSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.issues[0]?.message ?? "Invalid course data.",
      };
    }

    const updatedCourse = await updateCourse(id, parsed.data);

    if (!updatedCourse) {
      return {
        success: false as const,
        error: "Course not found.",
      };
    }

    revalidatePath("/academic/courses");
    revalidatePath(`/academic/courses/${id}`);
    revalidatePath(`/courses/${updatedCourse.slug}`);

    return {
      success: true as const,
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Update course error:", error);

    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}

export async function setCourseStatusAction(id: string, isActive: boolean) {
  try {
    await requireAcademicWriteAccess();

    if (!id.trim()) {
      return {
        success: false as const,
        error: "Course ID is required.",
      };
    }

    if (typeof isActive !== "boolean") {
      return {
        success: false as const,
        error: "Invalid course status.",
      };
    }

    const updatedCourse = await setCourseStatus(id, isActive);

    if (!updatedCourse) {
      return {
        success: false as const,
        error: "Course not found.",
      };
    }

    revalidatePath("/academic/courses");
    revalidatePath(`/academic/courses/${id}`);
    revalidatePath(`/courses/${updatedCourse.slug}`);

    return {
      success: true as const,
      data: updatedCourse,
    };
  } catch (error) {
    console.error("Update course status error:", error);

    return {
      success: false as const,
      error: getErrorMessage(error),
    };
  }
}
