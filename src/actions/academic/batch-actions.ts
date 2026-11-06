"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminOrManager } from "@/lib/authorize";
import { BatchService } from "@/server/services/academic/batch-service";

import {
  createBatchSchema,
  updateBatchSchema,
} from "@/validations/academic/batch-validation";

const batchService = new BatchService();

// ---------------------------------------------
// Types
// ---------------------------------------------

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

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

function getValidationError(error: z.ZodError) {
  return {
    error: error.issues[0]?.message ?? "Invalid input.",
    issues: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

async function authorizeBatchAction(): Promise<ActionResult | null> {
  const authorization = await requireAdminOrManager();

  if (!authorization.authorized) {
    return {
      success: false,
      error: authorization.message,
    };
  }

  return null;
}

function revalidateBatchPaths(id: string, slug?: string) {
  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${id}`);

  revalidatePath("/manager/batches");
  revalidatePath(`/manager/batches/${id}`);

  if (slug) {
    revalidatePath(`/batch/${slug}`);
  }
}

// ---------------------------------------------
// 1. Create Batch
// ---------------------------------------------

export async function createBatchAction(
  formData: z.input<typeof createBatchSchema>,
): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    // Validate input

    const parsed = createBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        ...getValidationError(parsed.error),
      };
    }

    // Create batch and teacher assignments atomically.

    const authorization = await requireAdminOrManager();

    if (!authorization.authorized) {
      return {
        success: false,
        error: authorization.message,
      };
    }

    const newBatch = await batchService.createBatch(
      parsed.data,
      authorization.user.id,
    );

    // Revalidate affected pages

    revalidatePath("/admin/batches");
    revalidatePath(`/admin/examinations/${parsed.data.examinationId}`);

    return {
      success: true,
      data: newBatch,
      message: "Batch created successfully.",
    };
  } catch (error: unknown) {
    console.error("createBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 2. Get All Batches (Admin)
// ---------------------------------------------

export async function getAllBatchesAction(): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    const batches = await batchService.getAllBatches();

    return {
      success: true,
      data: batches,
    };
  } catch (error: unknown) {
    console.error("getAllBatchesAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 3. Get All Published Batches (Public/Student)
// ---------------------------------------------

export async function getAllPublishedBatchesAction(): Promise<ActionResult> {
  try {
    const batches = await batchService.getAllPublishedBatches();

    return {
      success: true,
      data: batches,
    };
  } catch (error: unknown) {
    console.error("getAllPublishedBatchesAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 4. Update Batch
// ---------------------------------------------

export async function updateBatchAction(
  id: string,
  formData: z.input<typeof updateBatchSchema>,
): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    if (!id?.trim()) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    // Validate input

    const parsed = updateBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        ...getValidationError(parsed.error),
      };
    }

    if (Object.keys(parsed.data).length === 0) {
      return {
        success: false,
        error: "At least one field is required to update a batch.",
      };
    }

    // Fetch current batch for slug revalidation.

    const currentBatch = await batchService.getBatchById(id);

    // Update batch and synchronize teachers if supplied.

    const updatedBatch = await batchService.updateBatch(id, parsed.data);

    revalidateBatchPaths(id, currentBatch.slug);

    // Revalidate new slug if changed.

    if (updatedBatch.slug !== currentBatch.slug) {
      revalidatePath(`/batch/${updatedBatch.slug}`);
    }

    return {
      success: true,
      data: updatedBatch,
      message: "Batch updated successfully.",
    };
  } catch (error: unknown) {
    console.error("updateBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 5. Publish / Unpublish Batch
// ---------------------------------------------

export async function toggleBatchPublishStatusAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    if (!id?.trim()) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    if (typeof isPublished !== "boolean") {
      return {
        success: false,
        error: "Invalid publish status.",
      };
    }

    const batch = isPublished
      ? await batchService.publishBatch(id)
      : await batchService.unpublishBatch(id);

    revalidateBatchPaths(id, batch.slug);

    return {
      success: true,
      data: batch,
      message: isPublished
        ? "Batch published successfully."
        : "Batch unpublished successfully.",
    };
  } catch (error: unknown) {
    console.error("toggleBatchPublishStatusAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 6. Get Batches By Examination (Admin)
// ---------------------------------------------

export async function getBatchesByExaminationAction(
  examinationId: string,
): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    if (!examinationId?.trim()) {
      return {
        success: false,
        error: "Examination ID is required.",
      };
    }

    const batches = await batchService.getBatchesByExamination(examinationId);

    return {
      success: true,
      data: batches,
    };
  } catch (error: unknown) {
    console.error("getBatchesByExaminationAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 7. Get Published Batch By Slug (Public)
// ---------------------------------------------

export async function getBatchBySlugAction(
  slug: string,
): Promise<ActionResult> {
  try {
    if (!slug?.trim()) {
      return {
        success: false,
        error: "Batch slug is required.",
      };
    }

    const batch = await batchService.getBatchBySlug(slug.trim());

    return {
      success: true,
      data: batch,
    };
  } catch (error: unknown) {
    console.error("getBatchBySlugAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// ---------------------------------------------
// 8. Delete Batch (Soft Delete / Unpublish)
// ---------------------------------------------

export async function deleteBatchAction(id: string): Promise<ActionResult> {
  try {
    const authorizationError = await authorizeBatchAction();

    if (authorizationError) return authorizationError;

    if (!id?.trim()) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    // This performs an unpublish operation, not physical deletion.

    const batch = await batchService.unpublishBatch(id);

    revalidateBatchPaths(id, batch.slug);

    return {
      success: true,
      data: batch,
      message: "Batch unpublished successfully.",
    };
  } catch (error: unknown) {
    console.error("deleteBatchAction error:", error);

    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
