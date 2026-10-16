import { NextResponse } from "next/server";

// import { requireCourseManager } from
//   "@/server/auth/require-course-manager";

import { getAllTeacherProfiles } from "@/server/services/teacher-profile-service";

export async function GET() {
  try {
    // await requireCourseManager();

    const profiles = await getAllTeacherProfiles();

    return NextResponse.json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    console.error("GET /api/admin/teacher-profiles:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
