import { NextResponse } from "next/server";

import { getCourseContentByCourseId } from "@/services/academic/course-content/queries";

interface RouteContext {
  params: Promise<{
    courseId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;

    if (!courseId) {
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
