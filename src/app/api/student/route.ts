import { requireAdminOrManager } from "@/lib/authorize";
import { studentService } from "@/server/services/academic/student-service";
import { NextResponse } from "next/server";

export async function GET() {
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

    const [totalStudents, batches] = await Promise.all([
      studentService.getTotalStudents(),
      studentService.getStudentsPerBatch(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        batches,
      },
    });
  } catch (error) {
    console.error("Get student statistics error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
