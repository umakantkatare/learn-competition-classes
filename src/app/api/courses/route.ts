import { NextResponse } from "next/server";

import {
  createCourse,
  getActiveCourses,
} from "@/server/services/course-service";

import { createCourseSchema } from "@/validations/courses/course-validation";

export async function GET() {
  try {
    const courses = await getActiveCourses();

    return NextResponse.json({ success: true, data: courses }, { status: 200 });
  } catch (error) {
    console.error("GET /api/courses:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    // Validate input before calling the service.
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid course data",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const course = await createCourse(parsed.data);

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "A course with this slug already exists") {
      return NextResponse.json({ success: false, message }, { status: 409 });
    }

    console.error("POST /api/courses:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create course" },
      { status: 500 },
    );
  }
}
