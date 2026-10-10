import { NextResponse } from "next/server";

import { getActiveCourses } from "@/services/academic/course/queries";

export async function GET() {
  try {
    const courses = await getActiveCourses();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get active courses API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch active courses.",
      },
      { status: 500 },
    );
  }
}
