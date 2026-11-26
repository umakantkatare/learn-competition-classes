import { NextRequest, NextResponse } from "next/server";

import { requireAdminOrManager } from "@/lib/authorize";
import { studentService } from "@/server/services/academic/student-service";

type RouteContext = {
  params: Promise<{
    batchId: string;
  }>;
};

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const authResult = await requireAdminOrManager();

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.message,
        },
        { status: authResult.status },
      );
    }

    const { batchId } = await params;

    if (!batchId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Batch ID is required",
        },
        { status: 400 },
      );
    }

    const totalStudents = await studentService.getStudentsByBatchId(batchId);

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Get batch students error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
