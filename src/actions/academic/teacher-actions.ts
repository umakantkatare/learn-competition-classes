"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { TeacherService } from "@/server/services/academic/teacher-service";

import type {
  CreateTeacherInput,
  UpdateTeacherInput,
} from "@/validations/academic/teacher-validations";

import { createTeacherAuthUser } from "@/helper/createTeacherAuthUser";
import { requireAdminOrManager } from "@/lib/authorize";

const teacherService = new TeacherService();

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// Error handler
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

// Unauthorized response
function unauthorized<T = unknown>(): ActionResult<T> {
  return {
    success: false,
    error: "You are not authorized to perform this action.",
  };
}

// Validate ID
function isValidId(id: string): boolean {
  return typeof id === "string" && id.trim().length > 0;
}

// Revalidate teacher pages
function revalidateTeacherPaths(id?: string): void {
  revalidatePath("/admin/teachers");
  revalidatePath("/manager/teachers");

  if (id) {
    revalidatePath(`/admin/teachers/${id}`);
    revalidatePath(`/manager/teachers/${id}`);
  }
}

// 1. CREATE TEACHER
export async function createTeacherProfileAction(
  formData: CreateTeacherInput,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    const requestHeaders = await headers();

    const profile = await teacherService.createProfile(formData, {
      createAuthUser: (input) =>
        createTeacherAuthUser({
          ...input,
          headers: requestHeaders,
        }),
    });

    revalidateTeacherPaths();

    return {
      success: true,
      data: profile,
      message: "Teacher created successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 2. GET ALL TEACHERS
export async function getAllTeachersAction(): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    const teachers = await teacherService.getAllTeachers();

    return {
      success: true,
      data: teachers,
      message: "Teachers fetched successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 3. GET TEACHER PROFILE BY ID
export async function getTeacherProfileByIdAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!isValidId(id)) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const profile = await teacherService.getProfileById(id);

    return {
      success: true,
      data: profile,
      message: "Teacher profile fetched successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 4. GET TEACHER PROFILE BY USER ID
export async function getTeacherProfileByUserIdAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!isValidId(userId)) {
      return {
        success: false,
        error: "User ID is required.",
      };
    }

    const profile = await teacherService.getProfileByUserId(userId);

    return {
      success: true,
      data: profile,
      message: "Teacher profile fetched successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 5. UPDATE TEACHER PROFILE
export async function updateTeacherProfileAction(
  id: string,
  formData: UpdateTeacherInput,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!isValidId(id)) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const updatedProfile = await teacherService.updateProfile(id, formData);

    revalidateTeacherPaths(id);

    return {
      success: true,
      data: updatedProfile,
      message: "Teacher profile updated successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 6. DELETE TEACHER PROFILE
export async function deleteTeacherProfileAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!isValidId(id)) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const deletedProfile = await teacherService.deleteProfile(id);

    revalidateTeacherPaths(id);

    return {
      success: true,
      data: deletedProfile,
      message: "Teacher profile deleted successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
