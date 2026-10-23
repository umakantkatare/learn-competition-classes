"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { BatchService } from "@/server/services/academic/batch-service";
import {
  createBatchSchema,
  updateBatchSchema,
} from "@/validations/academic/academic-validations";

const batchService = new BatchService();

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

async function requireAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.role === "ADMIN";
}

// 1. Create Batch
export async function createBatchAction(
  formData: z.infer<typeof createBatchSchema>,
  teacherIds: string[] = [],
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const parsedTeacherIds = z
      .array(z.string().trim().min(1))
      .safeParse(teacherIds);

    if (!parsedTeacherIds.success) {
      return {
        success: false,
        error: "Invalid teacher IDs.",
      };
    }

    const batch = await batchService.createBatch(parsed.data, [
      ...new Set(parsedTeacherIds.data),
    ]);

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/examinations/${parsed.data.examinationId}`);

    return {
      success: true,
      data: batch,
      message: "Batch created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Batch
export async function updateBatchAction(
  id: string,
  formData: z.infer<typeof updateBatchSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Batch ID is required." };
    }

    const parsed = updateBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const currentBatch = await batchService.getBatchById(id);

    if (!currentBatch) {
      return { success: false, error: "Batch not found." };
    }

    const updatedBatch = await batchService.updateBatch(id, parsed.data);

    if (!updatedBatch) {
      return { success: false, error: "Failed to update batch." };
    }

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${id}`);
    revalidatePath(`/batch/${currentBatch.slug}`);
    revalidatePath(`/batch/${updatedBatch.slug}`);

    return {
      success: true,
      data: updatedBatch,
      message: "Batch updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Publish or unpublish Batch
export async function toggleBatchPublishStatusAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Batch ID is required." };
    }

    if (typeof isPublished !== "boolean") {
      return { success: false, error: "Invalid publish status." };
    }

    const batch = isPublished
      ? await batchService.publishBatch(id)
      : await batchService.unpublishBatch(id);

    if (!batch) {
      return {
        success: false,
        error: "Batch not found.",
      };
    }

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${id}`);
    revalidatePath(`/batch/${batch.slug}`);

    return {
      success: true,
      data: batch,
      message: isPublished
        ? "Batch published successfully."
        : "Batch unpublished successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Batches by Examination (Admin)
export async function getBatchesByExaminationAction(
  examinationId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!examinationId?.trim()) {
      return {
        success: false,
        error: "Examination ID is required.",
      };
    }

    const batches = await batchService.getBatchesByExamination(examinationId);

    return { success: true, data: batches };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Get published Batch by slug (Public)
export async function getBatchBySlugAction(
  slug: string,
): Promise<ActionResult> {
  try {
    if (!slug?.trim()) {
      return { success: false, error: "Batch slug is required." };
    }

    const batch = await batchService.getBatchBySlug(slug);

    return { success: true, data: batch };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 6. Unpublish Batch instead of physically deleting it
export async function deleteBatchAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Batch ID is required." };
    }

    const batch = await batchService.unpublishBatch(id);

    if (!batch) {
      return {
        success: false,
        error: "Batch not found.",
      };
    }

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/batches/${id}`);
    revalidatePath(`/batch/${batch.slug}`);

    return {
      success: true,
      data: batch,
      message: "Batch unpublished successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
