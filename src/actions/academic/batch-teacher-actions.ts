"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";

import { BatchTeacherService } from "@/server/services/academic/batch-teacher-service";
import { TeacherService } from "@/server/services/academic/teacher-service";

import {
  assignBatchTeacherSchema,
  assignBatchTeachersSchema,
  removeBatchTeacherSchema,
} from "@/validations/academic/batch-teacher-validations";

const batchTeacherService = new BatchTeacherService();
const teacherService = new TeacherService();

// ---------------------------------------------
// Types
// ---------------------------------------------

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

// ---------------------------------------------
// Helpers
// ---------------------------------------------

async function getSession(): Promise<Session | null> {
  return await auth.api.getSession({
    headers: await headers(),
  });
}

async function requireAdminOrManager(): Promise<Session | null> {
  const session = await getSession();

  if (!session) return null;

  const allowedRoles = ["ADMIN", "MANAGER"];

  if (!allowedRoles.includes(session.user.role ?? "")) {
    return null;
  }

  return session;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function getValidationError(error: z.ZodError) {
  return {
    error: error.issues[0]?.message ?? "Invalid input.",
    issues: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

function revalidateBatch(batchId: string) {
  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
}

// ---------------------------------------------
// Bulk Assignment Validation
// ---------------------------------------------

const bulkAssignmentSchema = z.object({
  batchId: z.string().trim().min(1, "Batch ID is required."),

  teacherIds: assignBatchTeachersSchema.shape.teacherIds
    .unwrap()
    .min(1, "At least one teacher must be selected.")
    .max(100, "You cannot assign more than 100 teachers at once."),
});

// ---------------------------------------------
// 1. Assign One Teacher To Batch
// ---------------------------------------------

export async function assignTeacherToBatchAction(
  formData: z.input<typeof assignBatchTeacherSchema>,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const parsed = assignBatchTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        ...getValidationError(parsed.error),
      };
    }

    const assignment = await batchTeacherService.assignTeacherToBatch(
      parsed.data.batchId,
      parsed.data.teacherId,
    );

    revalidateBatch(parsed.data.batchId);

    return {
      success: true,
      data: assignment,
      message: "Teacher assigned to batch successfully.",
    };
  } catch (error: unknown) {
    console.error("assignTeacherToBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 2. Assign Multiple Teachers To Batch
// ---------------------------------------------

export async function assignMultipleTeachersAction(
  batchId: string,
  teacherIds: string[],
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const parsed = bulkAssignmentSchema.safeParse({
      batchId,
      teacherIds,
    });

    if (!parsed.success) {
      return {
        success: false,
        ...getValidationError(parsed.error),
      };
    }

    // Duplicate IDs are rejected by validation.
    const assignments = await batchTeacherService.assignMultipleTeachers(
      parsed.data.batchId,
      parsed.data.teacherIds,
    );

    revalidateBatch(parsed.data.batchId);

    return {
      success: true,
      data: assignments,
      message: `${assignments.length} new teacher assignment(s) created.`,
    };
  } catch (error: unknown) {
    console.error("assignMultipleTeachersAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 3. Remove Teacher From Batch
// ---------------------------------------------

export async function removeTeacherFromBatchAction(
  formData: z.input<typeof removeBatchTeacherSchema>,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const parsed = removeBatchTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        ...getValidationError(parsed.error),
      };
    }

    const deletedAssignment = await batchTeacherService.removeTeacherFromBatch(
      parsed.data.batchId,
      parsed.data.teacherId,
    );

    revalidateBatch(parsed.data.batchId);

    return {
      success: true,
      data: deletedAssignment,
      message: "Teacher removed from batch successfully.",
    };
  } catch (error: unknown) {
    console.error("removeTeacherFromBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 4. Get Teachers Assigned To Batch (Admin)
// ---------------------------------------------

export async function getTeachersForBatchAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    const session = await requireAdminOrManager();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    if (!batchId?.trim()) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    const teachers = await batchTeacherService.getTeachersForBatch(batchId);

    return {
      success: true,
      data: teachers,
    };
  } catch (error: unknown) {
    console.error("getTeachersForBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 5. Get Batches For Authenticated Teacher
// ---------------------------------------------

export async function getBatchesForTeacherAction(): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    // Only authenticated teachers can access their assigned batches.
    if (session.user.role !== "TEACHER") {
      return {
        success: false,
        error: "Only teachers can access their assigned batches.",
      };
    }

    const profile = await teacherService.getProfileByUserId(session.user.id);

    if (!profile) {
      return {
        success: false,
        error: "Teacher profile not found.",
      };
    }

    const batches = await batchTeacherService.getBatchesForTeacher(profile.id);

    return {
      success: true,
      data: batches,
    };
  } catch (error: unknown) {
    console.error("getBatchesForTeacherAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
