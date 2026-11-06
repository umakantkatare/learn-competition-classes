import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { requireAdminOrManager } from "@/lib/authorize";
import { BatchService } from "@/server/services/academic/batch-service";

import { updateBatchSchema } from "@/validations/academic/batch-validation";

const batchService = new BatchService();

// ---------------------------------------------
// Types
// ---------------------------------------------

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ---------------------------------------------
// Helpers
// ---------------------------------------------

function getErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  const normalizedMessage = message.toLowerCase();

  // Not found

  if (
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("does not exist")
  ) {
    return { status: 404, message };
  }

  // Conflict

  if (
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("already using") ||
    normalizedMessage.includes("already assigned")
  ) {
    return { status: 409, message };
  }

  // Business validation errors

  if (
    normalizedMessage.includes("cannot") ||
    normalizedMessage.includes("must") ||
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("required") ||
    normalizedMessage.includes("greater than")
  ) {
    return { status: 400, message };
  }

  return {
    status: 500,
    message: "An unexpected error occurred.",
  };
}

function validationErrorResponse(
  issues: {
    path: PropertyKey[];
    message: string;
  }[],
) {
  return NextResponse.json(
    {
      success: false,
      error: issues[0]?.message ?? "Invalid batch data.",
      issues: issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
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
// GET: Fetch Published Batch By ID (Public)
// ---------------------------------------------

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Validate batch ID

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Batch ID is required.",
        },
        { status: 400 },
      );
    }

    // 2. Fetch published batch

    const batch = await batchService.getPublishedBatchById(id);

    // 3. Success response

    return NextResponse.json(
      {
        success: true,
        message: "Batch fetched successfully.",
        data: batch,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("GET /api/batches/[id] error:", error);

    const { status, message } = getErrorResponse(error);

    return NextResponse.json(
      {
        success: false,
        error: status === 500 ? "Failed to fetch batch." : message,
      },
      { status },
    );
  }
}

// ---------------------------------------------
// PATCH: Update Batch (Admin / Manager)
// ---------------------------------------------

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authorization

    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: access.error,
          message: access.message,
        },
        { status: access.status },
      );
    }

    // 2. Validate batch ID

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Batch ID is required.",
        },
        { status: 400 },
      );
    }

    // 3. Parse JSON

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    // 4. Validate body structure

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be a JSON object.",
        },
        { status: 400 },
      );
    }

    // 5. Zod validation

    const validationResult = updateBatchSchema.safeParse(body);

    if (!validationResult.success) {
      return validationErrorResponse(validationResult.error.issues);
    }

    if (Object.keys(validationResult.data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one field is required to update a batch.",
        },
        { status: 400 },
      );
    }

    // 6. Fetch current batch for slug revalidation

    const currentBatch = await batchService.getBatchById(id);

    // 7. Update batch and synchronize teachers

    const updatedBatch = await batchService.updateBatch(
      id,
      validationResult.data,
    );

    // 8. Revalidate affected pages

    revalidateBatchPaths(id, currentBatch.slug);

    if (updatedBatch.slug !== currentBatch.slug) {
      revalidatePath(`/batch/${updatedBatch.slug}`);
    }

    // 9. Success response

    return NextResponse.json(
      {
        success: true,
        message: "Batch updated successfully.",
        data: updatedBatch,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/batches/[id] error:", error);

    const { status, message } = getErrorResponse(error);

    return NextResponse.json(
      {
        success: false,
        error: status === 500 ? "Failed to update batch." : message,
      },
      { status },
    );
  }
}

// ---------------------------------------------
// DELETE: Unpublish Batch (Admin / Manager)
// ---------------------------------------------

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authorization

    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: access.error,
          message: access.message,
        },
        { status: access.status },
      );
    }

    // 2. Validate batch ID

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Batch ID is required.",
        },
        { status: 400 },
      );
    }

    // 3. Fetch current batch for cache revalidation

    const currentBatch = await batchService.getBatchById(id);

    // 4. Unpublish instead of physical deletion

    const updatedBatch = await batchService.unpublishBatch(id);

    // 5. Revalidate affected pages

    revalidateBatchPaths(id, currentBatch.slug);

    // 6. Success response

    return NextResponse.json(
      {
        success: true,
        message: "Batch unpublished successfully.",
        data: updatedBatch,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/batches/[id] error:", error);

    const { status, message } = getErrorResponse(error);

    return NextResponse.json(
      {
        success: false,
        error: status === 500 ? "Failed to unpublish batch." : message,
      },
      { status },
    );
  }
}
