"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminOrManager } from "@/lib/authorize";
import { BatchService } from "@/server/services/academic/batch-service";
import {
  createBatchSchema,
  updateBatchSchema,
} from "@/validations/academic/batch-validation";

// ---------------------------------------------
// Service
// ---------------------------------------------

const batchService = new BatchService();

// ---------------------------------------------
// Types
// ---------------------------------------------

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  issues?: {
    field: string;
    message: string;
  }[];
};

type BatchAuthorization =
  | {
      authorized: true;
      userId: string;
    }
  | {
      authorized: false;
      result: ActionResult;
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

function getValidationError(error: z.ZodError): ActionResult {
  return {
    success: false,
    error: error.issues[0]?.message ?? "Invalid input.",
    issues: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
}

/**
 * Authorizes admin or manager actions.
 * Returns the authenticated user ID to avoid duplicate authorization calls.
 */
async function authorizeBatchAction(): Promise<BatchAuthorization> {
  const authorization = await requireAdminOrManager();

  if (!authorization.authorized) {
    return {
      authorized: false,
      result: {
        success: false,
        error: authorization.message,
      },
    };
  }

  return {
    authorized: true,
    userId: authorization.user.id,
  };
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

function validateId(id: string): boolean {
  return typeof id === "string" && id.trim().length > 0;
}

// ---------------------------------------------
// 1. Create Batch
// ---------------------------------------------

export async function createBatchAction(
  formData: z.input<typeof createBatchSchema>,
): Promise<ActionResult> {
  try {
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

    // Validate input
    const parsed = createBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return getValidationError(parsed.error);
    }

    // Explicitly handle ImageKit media fields
    const batchData = {
      ...parsed.data,
      thumbnail: parsed.data.thumbnail ?? "",
      thumbnailFileId: parsed.data.thumbnailFileId ?? null,
      previewVideo: parsed.data.previewVideo ?? null,
      previewVideoFileId: parsed.data.previewVideoFileId ?? null,
    };

    // Create batch and teacher assignments
    const newBatch = await batchService.createBatch(
      batchData,
      authorization.userId,
    );

    // Revalidate affected pages
    revalidateBatchPaths(newBatch.id, newBatch.slug);

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
// 2. Get All Batches (Admin / Manager)
// ---------------------------------------------

export async function getAllBatchesAction(): Promise<ActionResult> {
  try {
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

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
// 3. Get All Published Batches (Public / Student)
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
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

    if (!validateId(id)) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    // Validate input
    const parsed = updateBatchSchema.safeParse(formData);

    if (!parsed.success) {
      return getValidationError(parsed.error);
    }

    if (Object.keys(parsed.data).length === 0) {
      return {
        success: false,
        error: "At least one field is required to update a batch.",
      };
    }

    // Fetch current batch for slug and examination revalidation
    const currentBatch = await batchService.getBatchById(id);

    // Update batch and synchronize teachers if supplied.
    // Media URL and ImageKit fileId fields are forwarded independently.
    const updatedBatch = await batchService.updateBatch(id, parsed.data);

    revalidateBatchPaths(id, currentBatch.slug);

    // Revalidate new slug if changed
    if (updatedBatch.slug !== currentBatch.slug) {
      revalidatePath(`/batch/${updatedBatch.slug}`);
    }

    // Revalidate examination pages if examination changed
    revalidatePath(`/admin/examinations/${currentBatch.examinationId}`);

    if (updatedBatch.examinationId !== currentBatch.examinationId) {
      revalidatePath(`/admin/examinations/${updatedBatch.examinationId}`);
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
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

    if (!validateId(id)) {
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

    const updatedBatch = isPublished
      ? await batchService.publishBatch(id)
      : await batchService.unpublishBatch(id);

    revalidateBatchPaths(id, updatedBatch.slug);

    return {
      success: true,
      data: updatedBatch,
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
// 6. Get Batches By Examination (Admin / Manager)
// ---------------------------------------------

export async function getBatchesByExaminationAction(
  examinationId: string,
): Promise<ActionResult> {
  try {
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

    if (!validateId(examinationId)) {
      return {
        success: false,
        error: "Examination ID is required.",
      };
    }

    const batches = await batchService.getBatchesByExamination(
      examinationId.trim(),
    );

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
    if (!validateId(slug)) {
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
    const authorization = await authorizeBatchAction();

    if (!authorization.authorized) {
      return authorization.result;
    }

    if (!validateId(id)) {
      return {
        success: false,
        error: "Batch ID is required.",
      };
    }

    // This performs an unpublish operation, not physical deletion.
    const updatedBatch = await batchService.unpublishBatch(id);

    revalidateBatchPaths(id, updatedBatch.slug);

    return {
      success: true,
      data: updatedBatch,
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
