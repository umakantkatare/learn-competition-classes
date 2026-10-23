"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { BatchTeacherService } from "@/server/services/academic/batch-teacher-service";
import { TeacherService } from "@/server/services/academic/teacher-service";
import { batchTeacherSchema } from "@/validations/academic/academic-validations";

const batchTeacherService = new BatchTeacherService();
const teacherService = new TeacherService();

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
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

async function requireAdminOrManager(): Promise<boolean> {
  const session = await getSession();

  return ["ADMIN", "MANAGER"].includes(session?.user?.role ?? "");
}

const bulkAssignmentSchema = z.object({
  batchId: z.string().trim().min(1, "Batch ID is required."),
  teacherIds: z.array(z.string().trim().min(1)).min(1).max(100),
});

// 1. Assign one teacher to a batch
export async function assignTeacherToBatchAction(
  formData: z.infer<typeof batchTeacherSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = batchTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const assignment = await batchTeacherService.assignTeacherToBatch(
      parsed.data.batchId,
      parsed.data.teacherId,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);

    return {
      success: true,
      data: assignment,
      message: "Teacher assigned to batch successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Assign multiple teachers to a batch
export async function assignMultipleTeachersAction(
  batchId: string,
  teacherIds: string[],
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = bulkAssignmentSchema.safeParse({
      batchId,
      teacherIds,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const uniqueTeacherIds = [...new Set(parsed.data.teacherIds)];

    const assignments = await batchTeacherService.assignMultipleTeachers(
      parsed.data.batchId,
      uniqueTeacherIds,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);

    return {
      success: true,
      data: assignments,
      message: `${assignments.length} new teacher assignment(s) created.`,
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Remove a teacher from a batch
export async function removeTeacherFromBatchAction(
  formData: z.infer<typeof batchTeacherSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = batchTeacherSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    await batchTeacherService.removeTeacherFromBatch(
      parsed.data.batchId,
      parsed.data.teacherId,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);

    return {
      success: true,
      message: "Teacher removed from batch successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get teachers assigned to a batch — Admin/Manager
export async function getTeachersForBatchAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!batchId?.trim()) {
      return { success: false, error: "Batch ID is required." };
    }

    const teachers = await batchTeacherService.getTeachersForBatch(batchId);

    return { success: true, data: teachers };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Get batches for the authenticated teacher
export async function getBatchesForTeacherAction(): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    const profile = await teacherService.getProfileByUserId(session.user.id);

    const batches = await batchTeacherService.getBatchesForTeacher(profile.id);

    return { success: true, data: batches };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
