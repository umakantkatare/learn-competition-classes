import { NextResponse } from "next/server";

import {
  getCourseById,
  updateCourse,
  deleteCourse,
} from "@/server/services/course-service";

import { updateCourseSchema } from "@/validations/courses/course-validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const course = await getCourseById(id);

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
    const { id } = await params;
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

    const course = await updateCourse(id, parsed.data);

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
    const { id } = await params;

    const course = await deleteCourse(id);

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
