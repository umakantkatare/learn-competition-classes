import { NextResponse } from "next/server";

import { getAvailableSubjectsForCourse } from "@/services/academic/course-subject/queries";

interface RouteProps {
  params: Promise<{ courseId: string }>;
}

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { courseId } = await params;
    const subjects = await getAvailableSubjectsForCourse(courseId);

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Get available course subjects API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch available subjects.",
      },
      { status: 500 },
    );
  }
}
