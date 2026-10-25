import { NextRequest, NextResponse } from "next/server";

import { BatchService } from "@/server/services/academic/batch-service";
import { createBatchSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const batchService = new BatchService();

// GET: Fetch batches by examination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examinationId = searchParams.get("examinationId");

    if (!examinationId) {
      return NextResponse.json(
        {
          success: false,
          error: "examinationId query parameter is required",
        },
        { status: 400 },
      );
    }

    const batches = await batchService.getBatchesByExamination(examinationId);

    // Public listing: expose published batches only.
    const publishedBatches = batches.filter((batch) => batch.isPublished);

    return NextResponse.json(
      {
        success: true,
        data: publishedBatches,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/batches error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch batches",
      },
      { status: 500 },
    );
  }
}

// POST: Create a batch
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, error: "Request body must be a JSON object" },
        { status: 400 },
      );
    }

    const { teacherIds, subjectIds, ...batchData } = body as Record<
      string,
      unknown
    >;

    // Validate optional relationship IDs separately.
    if (
      teacherIds !== undefined &&
      (!Array.isArray(teacherIds) ||
        !teacherIds.every(
          (id) => typeof id === "string" && id.trim().length > 0,
        ))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "teacherIds must be an array of non-empty strings",
        },
        { status: 400 },
      );
    }

    if (
      subjectIds !== undefined &&
      (!Array.isArray(subjectIds) ||
        !subjectIds.every(
          (id) => typeof id === "string" && id.trim().length > 0,
        ))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "subjectIds must be an array of non-empty strings",
        },
        { status: 400 },
      );
    }

    const validationResult = createBatchSchema.safeParse(batchData);

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

    const newBatch = await batchService.createBatch(
      validationResult.data,
      teacherIds as string[] | undefined,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully",
        data: newBatch,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/batches error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create batch",
      },
      { status: 500 },
    );
  }
}
