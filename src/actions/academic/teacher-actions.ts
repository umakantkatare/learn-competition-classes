"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { TeacherService } from "@/server/services/academic/teacher-service";

import {
  createTeacherSchema,
  updateTeacherSchema,
  type CreateTeacherInput,
  type UpdateTeacherInput,
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
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

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

// Revalidate teacher pages
function revalidateTeacherPaths(id?: string): void {
  revalidatePath("/admin/teachers");
  revalidatePath("/manager/teachers");

  if (id) {
    revalidatePath(`/admin/teachers/${id}`);
    revalidatePath(`/manager/teachers/${id}`);
  }
}


export async function createTeacherProfileAction(
  formData: CreateTeacherInput,
): Promise<ActionResult> {
  try {
    const requestHeaders = await headers();
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    // Validate input
    const parsed = createTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const profile = await teacherService.createProfile(parsed.data, {
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

// 2. GET ALL TEACHERS — ADMIN / MANAGER

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

// 3. GET TEACHER PROFILE BY ID — ADMIN / MANAGER

export async function getTeacherProfileByIdAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager ();

    if (!session) {
      return unauthorized();
    }

    if (!id?.trim()) {
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

// 4. GET TEACHER PROFILE BY USER ID — ADMIN / MANAGER

export async function getTeacherProfileByUserIdAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!userId?.trim()) {
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

// 5. UPDATE TEACHER PROFILE — ADMIN / MANAGER

export async function updateTeacherProfileAction(
  id: string,
  formData: UpdateTeacherInput,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return unauthorized();
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const parsed = updateTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const updatedProfile = await teacherService.updateProfile(id, parsed.data);

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

// 6. DELETE TEACHER PROFILE — ADMIN / MANAGER

export async function deleteTeacherProfileAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager ();

    if (!session) {
      return unauthorized();
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const deletedProfile = await teacherService.deleteProfile(id);

    revalidateTeacherPaths();

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
