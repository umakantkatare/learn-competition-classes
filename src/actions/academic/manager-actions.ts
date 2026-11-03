"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AuthorizationError, getSession, requireAdmin } from "@/lib/authorize";

import { ManagerService } from "@/server/services/academic/manager-service";

import {
  createManagerSchema,
  updateManagerProfileSchema,
  updateOwnManagerProfileSchema,
} from "@/validations/academic/manager-validations";
import { createManagerAuthUser } from "@/helper/createManagerAuthUser";
import { headers } from "next/headers";

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

function handleError(error: unknown): ActionResult {
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

function unauthorized(): ActionResult {
  return {
    success: false,
    code: "UNAUTHORIZED",
    error: "Authentication is required. Please log in.",
  };
}

function forbidden(): ActionResult {
  return {
    success: false,
    code: "FORBIDDEN",
    error: "You do not have permission to perform this action.",
  };
}

function validationError(message: string): ActionResult {
  return {
    success: false,
    code: "VALIDATION_ERROR",
    error: message,
  };
}

/**
 * 1. Create Manager — Admin only.
 *
 * Creates a Better Auth user and manager profile,
 * then sends the temporary-password email.
 *
 * Email OTP verification is not required.
 */
// export async function createManagerAction(
//   formData: z.input<typeof createManagerSchema>,
//   dependencies: {
//     createAuthUser: (input: {
//       name: string;
//       email: string;
//       password: string;
//       phoneNumber: string;
//       image?: string | null;
//       avatarFileId?: string | null;
//     }) => Promise<{
//       id: string;
//       name: string;
//       email: string;
//     }>;
//   },
// ): Promise<ActionResult> {
//   try {
//     await requireAdmin();

//     const parsed = createManagerSchema.safeParse(formData);

//     if (!parsed.success) {
//       return validationError(
//         parsed.error.issues[0]?.message ?? "Invalid manager details.",
//       );
//     }

//     const result = await managerService.createManager(
//       parsed.data,
//       dependencies,
//     );

//     revalidatePath("/admin/managers");

//     return {
//       success: true,
//       data: result,
//       message: "Manager created successfully.",
//     };
//   } catch (error: unknown) {
//     return handleError(error);
//   }
// }

export async function createManagerAction(
  formData: import("zod").input<typeof createManagerSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const parsed = createManagerSchema.safeParse(formData);

    if (!parsed.success) {
      return validationError(
        parsed.error.issues[0]?.message ?? "Invalid manager details.",
      );
    }

    const requestHeaders = await headers();

    const result = await managerService.createManager(parsed.data, {
      createAuthUser: (input) =>
        createManagerAuthUser({
          ...input,
          headers: requestHeaders,
        }),
    });

    revalidatePath("/admin/managers");

    return {
      success: true,
      data: result,
      message: "Manager created successfully.",
    };
  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * 2. Update Manager Employee Code — Admin only.
 */
export async function updateManagerProfileAction(
  id: string,
  formData: z.input<typeof updateManagerProfileSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return validationError("Manager profile ID is required.");
    }

    const parsed = updateManagerProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return validationError(
        parsed.error.issues[0]?.message ?? "Invalid manager details.",
      );
    }

    const updatedProfile = await managerService.updateManagerProfile(
      id,
      parsed.data,
    );

    revalidatePath("/admin/managers");
    revalidatePath(`/admin/managers/${id}`);

    return {
      success: true,
      data: updatedProfile,
      message: "Manager profile updated successfully.",
    };
  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * 3. Update Own Profile — Authenticated Manager.
 *
 * The user ID comes from the server-side session.
 */
export async function updateOwnManagerProfileAction(
  formData: z.input<typeof updateOwnManagerProfileSchema>,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (session.user.role !== "manager") {
      return forbidden();
    }

    const parsed = updateOwnManagerProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return validationError(
        parsed.error.issues[0]?.message ?? "Invalid profile details.",
      );
    }

    const updatedUser = await managerService.updateOwnProfile(
      session.user.id,
      parsed.data,
    );

    revalidatePath("/manager/profile");
    revalidatePath("/manager/dashboard");

    return {
      success: true,
      data: updatedUser,
      message: "Your profile has been updated successfully.",
    };
  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * 4. Get Manager Profile by User ID.
 *
 * Admin or the same manager.
 */
export async function getManagerProfileByUserIdAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (!userId?.trim()) {
      return validationError("User ID is required.");
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
    return handleError(error);
  }
}

/**
 * 5. Get Manager Profile by Profile ID.
 *
 * Admin or the profile owner.
 */
export async function getManagerProfileByIdAction(
  id: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return unauthorized();
    }

    if (!id?.trim()) {
      return validationError("Manager profile ID is required.");
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
    return handleError(error);
  }
}

/**
 * 6. Get All Managers — Admin only.
 */
export async function getAllManagerProfilesAction(): Promise<ActionResult> {
  try {
    await requireAdmin();

    const profiles = await managerService.getAllManagers();

    return {
      success: true,
      data: profiles,
      message: "Managers retrieved successfully.",
    };
  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * 7. Delete Manager Profile — Admin only.
 *
 * Deletes only the manager profile.
 * It does not delete or deactivate the Better Auth user.
 */
export async function deleteManagerProfileAction(
  id: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!id?.trim()) {
      return validationError("Manager profile ID is required.");
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
    return handleError(error);
  }
}
