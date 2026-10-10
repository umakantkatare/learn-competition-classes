import { NextResponse } from "next/server";

import { getCourses } from "@/services/academic/course/queries";

export async function GET() {
  try {
    const courses = await getCourses();

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to fetch courses.",
      },
      { status: 500 },
    );
  }
}
