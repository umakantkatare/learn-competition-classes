import { NextResponse } from "next/server";

import { getCourseContentByCourseId } from "@/services/academic/course-content/queries";
import { requireAcademicAccess } from "@/lib/authorization/academic";

interface RouteContext {
  params: Promise<{
    courseId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAcademicAccess();

    const { courseId } = await params;

    if (!courseId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Course ID is required",
        },
        { status: 400 },
      );
    }

    const content = await getCourseContentByCourseId(courseId);

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("Failed to fetch course content:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch course content",
      },
      { status: 500 },
    );
  }
}
