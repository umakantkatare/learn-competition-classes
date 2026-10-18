import { NextResponse } from "next/server";

import {
  getCourseById,
  updateCourse,
  deleteCourse,
} from "@/server/services/course-service";

import { updateCourseSchema } from "@/validations/courses/course-validation";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;
    const course = await getCourseById(courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error) {
    console.error("GET /api/courses/[id]:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;
    const body: unknown = await request.json();

    const parsed = updateCourseSchema.safeParse(body);

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

    const course = await updateCourse(courseId, parsed.data);

    return NextResponse.json({ success: true, data: course }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "Course not found") {
      return NextResponse.json({ success: false, message }, { status: 404 });
    }

    if (message === "A course with this slug already exists") {
      return NextResponse.json({ success: false, message }, { status: 409 });
    }

    console.error("PATCH /api/courses/[id]:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;

    const course = await deleteCourse(courseId);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, message: "Course deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/courses/[id]:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete course" },
      { status: 500 },
    );
  }
}
