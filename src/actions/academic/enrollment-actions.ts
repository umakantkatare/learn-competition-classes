"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAuth, requireAdmin } from "@/lib/authorize";

import { EnrollmentService } from "@/server/services/academic/enrollment-service";

import {
  createEnrollmentSchema,
  updateEnrollmentSchema,
} from "@/validations/academic/academic-validations";

const enrollmentService = new EnrollmentService();

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  hasAccess?: boolean;
  message?: string;
  error?: string;
};

// ---------------------------------------------
// Validation
// ---------------------------------------------

const idSchema = z
  .string()
  .trim()
  .min(1, "ID is required.")
  .max(128, "Invalid ID.");

const enrollmentExpiryUpdateSchema = z
  .object({
    expiresAt: z.coerce.date().nullable(),
  })
  .strict();

// ---------------------------------------------
// Helpers
// ---------------------------------------------

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function revalidateEnrollmentPaths(): void {
  revalidatePath("/admin/enrollments");
  revalidatePath("/dashboard/my-batches");
  revalidatePath("/student/my-batches");
}

// ---------------------------------------------
// 1. Create Enrollment - ADMIN ONLY
// ---------------------------------------------

export async function createEnrollmentAction(
  input: z.infer<typeof createEnrollmentSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validatedData = createEnrollmentSchema.parse(input);

    const enrollment = await enrollmentService.enrollStudent(
      validatedData.userId,
      validatedData.batchId,
      validatedData.orderId ?? undefined,
    );

    revalidateEnrollmentPaths();

    return {
      success: true,
      data: enrollment,
      message: "Student enrolled successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 2. Update Enrollment - ADMIN ONLY
// ---------------------------------------------

export async function updateEnrollmentAction(
  id: string,
  input: z.infer<typeof updateEnrollmentSchema>,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const enrollmentId = idSchema.parse(id);
    const validatedData = enrollmentExpiryUpdateSchema.parse(input);

    const updatedEnrollment = await enrollmentService.updateEnrollment(
      enrollmentId,
      validatedData,
    );

    revalidateEnrollmentPaths();

    return {
      success: true,
      data: updatedEnrollment,
      message: "Enrollment updated successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 3. Check Access - AUTHENTICATED USER
// ---------------------------------------------

export async function checkValidAccessAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    const validatedBatchId = idSchema.parse(batchId);

    const user = await requireAuth();

    const hasAccess = await enrollmentService.hasValidAccess(
      user.id,
      validatedBatchId,
    );

    return {
      success: true,
      hasAccess,
    };
  } catch (error: unknown) {
    return {
      success: false,
      hasAccess: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 4. Get User Enrollment History
// ---------------------------------------------

export async function getUserEnrollmentsAction(): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const enrollments = await enrollmentService.getUserEnrollments(user.id);

    return {
      success: true,
      data: enrollments,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 5. Get My Batches - AUTHENTICATED USER
// ---------------------------------------------

export async function getMyBatchesAction(): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const batches = await enrollmentService.getUserEnrollmentsWithBatch(
      user.id,
    );

    return {
      success: true,
      data: batches,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 6. Revoke Enrollment - ADMIN ONLY
// ---------------------------------------------

export async function revokeEnrollmentAction(
  enrollmentId: string,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validatedId = idSchema.parse(enrollmentId);

    const enrollment = await enrollmentService.revokeEnrollment(validatedId);

    revalidateEnrollmentPaths();

    return {
      success: true,
      data: enrollment,
      message: "Enrollment access has been revoked.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 7. Extend Enrollment Validity - ADMIN ONLY
// ---------------------------------------------

export async function extendValidityAction(
  enrollmentId: string,
  extraMonths: number,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const validatedId = idSchema.parse(enrollmentId);

    const validatedMonths = z
      .number()
      .int()
      .min(1, "At least one month is required.")
      .max(24, "Cannot extend by more than 24 months at once.")
      .parse(extraMonths);

    const updatedEnrollment = await enrollmentService.extendValidity(
      validatedId,
      validatedMonths,
    );

    revalidateEnrollmentPaths();

    return {
      success: true,
      data: updatedEnrollment,
      message: `Validity extended by ${validatedMonths} months.`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
