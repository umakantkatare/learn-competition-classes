"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/authorize";
import { AuthorizationError, requireAdmin } from "@/lib/authorize";
import { ManagerService } from "@/server/services/academic/manager-service";
import {
  createManagerProfileSchema,
  updateManagerProfileSchema,
} from "@/validations/academic/academic-validations";

const managerService = new ManagerService();

type ActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
      message?: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

// Extract a meaningful error message
function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof AuthorizationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

// Return a consistent authorization failure
function unauthorized(
  message = "Authentication is required. Please log in.",
): ActionResult {
  return {
    success: false,
    code: "UNAUTHORIZED",
    error: message,
  };
}

function forbidden(): ActionResult {
  return {
    success: false,
    code: "FORBIDDEN",
    error: "You do not have permission to perform this action.",
  };
}

// 1. Create Manager Profile — Admin only
export async function createManagerProfileAction(
  formData: z.infer<typeof createManagerProfileSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = createManagerProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const profile = await managerService.createProfile(parsed.data);

    revalidatePath("/admin/managers");

    return {
      success: true,
      data: profile,
      message: "Manager profile created successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 2. Update Manager Profile — Admin or profile owner
export async function updateManagerProfileAction(
  id: string,
  formData: z.infer<typeof updateManagerProfileSchema>,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (!id?.trim()) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: "Manager profile ID is required.",
      };
    }

    const parsed = updateManagerProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const existingProfile = await managerService.getProfileById(id);

    const isAdmin = session.user.role === "admin";
    const isOwner = existingProfile.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return forbidden();
    }

    const updatedProfile = await managerService.updateProfile(id, parsed.data);

    revalidatePath("/admin/managers");
    revalidatePath(`/admin/managers/${id}`);

    return {
      success: true,
      data: updatedProfile,
      message: "Manager profile updated successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 3. Get Manager Profile by User ID — Admin or same user
export async function getManagerProfileByUserIdAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (!userId?.trim()) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: "User ID is required.",
      };
    }

    const isAdmin = session.user.role === "admin";
    const isOwner = session.user.id === userId;

    if (!isAdmin && !isOwner) {
      return forbidden();
    }

    const profile = await managerService.getProfileByUserId(userId);

    return {
      success: true,
      data: profile,
      message: "Manager profile retrieved successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 4. Get Manager Profile by Profile ID — Admin or profile owner
export async function getManagerProfileByIdAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (!id?.trim()) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: "Manager profile ID is required.",
      };
    }

    const profile = await managerService.getProfileById(id);

    const isAdmin = session.user.role === "admin";
    const isOwner = profile.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return forbidden();
    }

    return {
      success: true,
      data: profile,
      message: "Manager profile retrieved successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 5. Get All Manager Profiles — Admin only
export async function getAllManagerProfilesAction(): Promise<ActionResult> {
  try {
    await requireAdmin();

    const profiles = await managerService.getAllManagers();

    return {
      success: true,
      data: profiles,
      message: "Manager profiles retrieved successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 6. Delete Manager Profile — Admin only
export async function deleteManagerProfileAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        error: "Manager profile ID is required.",
      };
    }

    const deletedProfile = await managerService.deleteProfile(id);

    revalidatePath("/admin/managers");
    revalidatePath(`/admin/managers/${id}`);

    return {
      success: true,
      data: deletedProfile,
      message: "Manager profile deleted successfully.",
    };
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return {
        success: false,
        code: error.code,
        error: error.message,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
