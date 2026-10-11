import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getStudentCourseContent } from "@/services/academic/course-content/student-access";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

function Response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response({ success: false, message: "Unauthorized" }, 401);
    }

    const { courseId } = await params;

    if (!courseId?.trim()) {
      return Response(
        { success: false, message: "Course ID is required" },
        400,
      );
    }

    const result = await getStudentCourseContent(session.user.id, courseId);

    return Response({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Student course content API error:", error);

    return Response(
      {
        success: false,
        message: "Unable to fetch course content",
      },
      500,
    );
  }
}
