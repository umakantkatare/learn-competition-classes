import { NextRequest, NextResponse } from "next/server";
import { BatchService } from "@/server/services/academic/batch-service";

const batchService = new BatchService();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // 1. Verify cron authorization
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized cron request.",
        },
        { status: 401 },
      );
    }

    // 2. Update batch statuses
    const result = await batchService.updateBatchStatuses();

    // 3. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Batch statuses updated successfully.",
        data: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("GET /api/cron/update-batch-status error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update batch statuses.",
      },
      { status: 500 },
    );
  }
}
