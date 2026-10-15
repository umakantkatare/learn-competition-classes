import { NextResponse } from "next/server";

import { getCourseSubjects } from "@/server/services/course-subject-service";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    // await requireCourseManager();

    const { courseId } = await params;
    const subjects = await getCourseSubjects(courseId);

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status =
      message === "UNAUTHORIZED"
        ? 401
        : message === "FORBIDDEN"
          ? 403
          : message === "Course not found"
            ? 404
            : 500;

    return NextResponse.json(
      {
        success: false,
        message: status === 500 ? "Internal server error" : message,
      },
      { status },
    );
  }
}
