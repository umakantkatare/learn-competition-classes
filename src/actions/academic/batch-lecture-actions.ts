"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { BatchLectureService } from "@/server/services/academic/batch-lecture-service";
import { batchLectureSchema } from "@/validations/academic/academic-validations";

const batchLectureService = new BatchLectureService();

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

async function requireAdminOrManager(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return ["ADMIN", "MANAGER"].includes(session?.user?.role ?? "");
}

const bulkAssignmentSchema = z.object({
  batchId: z.string().trim().min(1, "Batch ID is required."),
  lectureIds: z.array(z.string().trim().min(1)).min(1).max(500),
});

// 1. Assign one lecture to a batch
export async function assignLectureToBatchAction(
  formData: z.infer<typeof batchLectureSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = batchLectureSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const assignment = await batchLectureService.assignLectureToBatch(
      parsed.data.batchId,
      parsed.data.lectureId,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);
    revalidatePath(`/admin/lectures/${parsed.data.lectureId}`);

    return {
      success: true,
      data: assignment,
      message: "Lecture assigned to batch successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Assign multiple lectures to a batch
export async function assignMultipleLecturesAction(
  batchId: string,
  lectureIds: string[],
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = bulkAssignmentSchema.safeParse({
      batchId,
      lectureIds,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const uniqueLectureIds = [...new Set(parsed.data.lectureIds)];

    const assignments = await batchLectureService.assignMultipleLectures(
      parsed.data.batchId,
      uniqueLectureIds,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);

    for (const lectureId of uniqueLectureIds) {
      revalidatePath(`/admin/lectures/${lectureId}`);
    }

    return {
      success: true,
      data: assignments,
      message: `${assignments.length} new lecture assignment(s) created.`,
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Remove a lecture from a batch
export async function removeLectureFromBatchAction(
  formData: z.infer<typeof batchLectureSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = batchLectureSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    await batchLectureService.removeLectureFromBatch(
      parsed.data.batchId,
      parsed.data.lectureId,
    );

    revalidatePath(`/admin/batches/${parsed.data.batchId}`);
    revalidatePath(`/admin/lectures/${parsed.data.lectureId}`);

    return {
      success: true,
      message: "Lecture removed from batch successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get lectures assigned to a batch — Admin/Manager
export async function getLecturesForBatchAction(
  batchId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!batchId?.trim()) {
      return { success: false, error: "Batch ID is required." };
    }

    const lectures = await batchLectureService.getLecturesForBatch(batchId);

    return { success: true, data: lectures };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Get batches containing a lecture — Admin/Manager
export async function getBatchesForLectureAction(
  lectureId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!lectureId?.trim()) {
      return { success: false, error: "Lecture ID is required." };
    }

    const batches = await batchLectureService.getBatchesForLecture(lectureId);

    return { success: true, data: batches };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
