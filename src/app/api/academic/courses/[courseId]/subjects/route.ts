import { NextResponse } from "next/server";

import { getSubjectsByCourseId } from "@/services/academic/course-subject/queries";

interface RouteProps {
  params: Promise<{ courseId: string }>;
}

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { courseId } = await params;
    const subjects = await getSubjectsByCourseId(courseId);

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error("Get course subjects API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch course subjects.",
      },
      { status: 500 },
    );
  }
}
