"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
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

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function requireAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}

// 1. Manual enrollment: ADMIN only.
export async function createEnrollmentAction(
  input: z.infer<typeof createEnrollmentSchema>,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only admins can manually enroll students.",
      };
    }

    const validatedData = createEnrollmentSchema.parse(input);

    const enrollment = await enrollmentService.enrollStudent(
      validatedData.userId,
      validatedData.batchId,
      validatedData.orderId || undefined,
    );

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard/my-courses");

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

// 2. Update enrollment: ADMIN only.
// Requires EnrollmentService.updateEnrollment() to be implemented
// with field-level validation and allowed status transitions.
export async function updateEnrollmentAction(
  id: string,
  input: z.infer<typeof updateEnrollmentSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: "Unauthorized. Admin access is required.",
      };
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Enrollment ID is required.",
      };
    }

    const validatedData = updateEnrollmentSchema.parse(input);

    // Implement this service method before enabling this action.
    const updatedEnrollment = await enrollmentService.updateEnrollment(
      id,
      validatedData,
    );

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard/my-courses");

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

// 3. Check access for the currently authenticated user.
// Never accept userId from the client for this check.
export async function checkValidAccessAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: true,
        hasAccess: false,
      };
    }

    if (!batchId?.trim()) {
      return {
        success: false,
        hasAccess: false,
        error: "Batch ID is required.",
      };
    }

    const hasAccess = await enrollmentService.hasValidAccess(
      session.user.id,
      batchId,
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

// 4. Fetch enrollments for the currently authenticated student.
export async function getUserEnrollmentsAction(): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const enrollments = await enrollmentService.getUserEnrollments(
      session.user.id,
    );

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

// 5. Revoke access: ADMIN only.
// Service must implement revocation using your existing schema;
// do not assume a REVOKED enum value exists.
export async function revokeEnrollmentAction(
  enrollmentId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: "Unauthorized. Admin access is required.",
      };
    }

    if (!enrollmentId?.trim()) {
      return {
        success: false,
        error: "Enrollment ID is required.",
      };
    }

    await enrollmentService.revokeEnrollment(enrollmentId);

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard/my-courses");

    return {
      success: true,
      message: "Enrollment access has been revoked.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 6. Extend enrollment validity: ADMIN only.
export async function extendValidityAction(
  enrollmentId: string,
  extraMonths: number,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return {
        success: false,
        error: "Unauthorized. Admin access is required.",
      };
    }

    if (!enrollmentId?.trim()) {
      return {
        success: false,
        error: "Enrollment ID is required.",
      };
    }

    const validatedMonths = z
      .number()
      .int()
      .min(1, "At least one month is required.")
      .max(24, "Cannot extend by more than 24 months at once.")
      .parse(extraMonths);

    const updatedEnrollment = await enrollmentService.extendValidity(
      enrollmentId,
      validatedMonths,
    );

    revalidatePath("/admin/enrollments");
    revalidatePath("/dashboard/my-courses");

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
