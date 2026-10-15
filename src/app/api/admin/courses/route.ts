import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
// import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function GET() {
  try {
    // await requireCourseManagementAccess();

    const courses = await db
      .select()
      .from(course)
      .orderBy(desc(course.createdAt));

    return NextResponse.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 500;

    return NextResponse.json({ success: false, message }, { status });
  }
}
