import { NextRequest, NextResponse } from "next/server";

import { BatchService } from "@/server/services/academic/batch-service";
import { updateBatchSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const batchService = new BatchService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch a batch by ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const batch = await batchService.getBatchById(id);

    if (!batch || !batch.isPublished) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: batch }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/batches/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch batch" },
      { status: 500 },
    );
  }
}

// PATCH: Update a batch
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const validationResult = updateBatchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Invalid batch data",
        },
        { status: 400 },
      );
    }

    const updatedBatch = await batchService.updateBatch(
      id,
      validationResult.data,
    );

    if (!updatedBatch) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Batch updated successfully",
        data: updatedBatch,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/batches/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update batch" },
      { status: 500 },
    );
  }
}

// DELETE: Unpublish a batch instead of permanently deleting it
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const updatedBatch = await batchService.updateBatch(id, {
      isPublished: false,
    });

    if (!updatedBatch) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Batch unpublished successfully",
        data: updatedBatch,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/batches/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to unpublish batch" },
      { status: 500 },
    );
  }
}
