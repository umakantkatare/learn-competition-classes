import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrManager } from "@/lib/authorize";
import { BatchService } from "@/server/services/academic/batch-service";
import { createBatchSchema } from "@/validations/academic/batch-validation";

const batchService = new BatchService();

function getErrorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("does not exist")
  ) {
    return {
      status: 404,
      message,
    };
  }

  if (
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("already using") ||
    normalizedMessage.includes("already assigned")
  ) {
    return {
      status: 409,
      message,
    };
  }

  // Business validation errors
  if (
    normalizedMessage.includes("cannot") ||
    normalizedMessage.includes("must") ||
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("greater than") ||
    normalizedMessage.includes("required")
  ) {
    return {
      status: 400,
      message,
    };
  }

  // Unexpected server error
  return {
    status: 500,
    message: "An unexpected error occurred.",
  };
}

// ---------------------------------------------
// GET: Fetch Published Batches By Examination
// ---------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const examinationId = searchParams.get("examinationId")?.trim();

    let batches;

    if (examinationId) {
      const examinationBatches =
        await batchService.getBatchesByExamination(examinationId);

      batches = examinationBatches.filter((batch) => batch.isPublished);
    } else {
      batches = await batchService.getAllPublishedBatches();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Batches fetched successfully.",
        data: batches,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("GET /api/academic/batches error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch batches.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

    // 2. Parse JSON
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

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Request body must be a JSON object.",
        },
        { status: 400 },
      );
    }

    const validationResult = createBatchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Invalid batch data.",
          issues: validationResult.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const newBatch = await batchService.createBatch(
      validationResult.data,
      access.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Batch created successfully.",
        data: newBatch,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("POST /api/batches error:", error);

    const { status, message } = getErrorResponse(error);

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}
