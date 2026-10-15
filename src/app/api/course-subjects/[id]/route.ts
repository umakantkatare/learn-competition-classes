import { NextResponse } from "next/server";

import { updateCourseSubjectSchema } from "@/validations/courses/course-subject-schema";
// import { requireCourseManager } from "@/server/utils/auth-guard";
import {
  deleteCourseSubject,
  getCourseSubjectById,
  updateCourseSubject,
} from "@/server/services/course-subject-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message === "UNAUTHORIZED"
      ? 401
      : message === "FORBIDDEN"
        ? 403
        : message === "Subject not found" || message === "Course not found"
          ? 404
          : 400;

  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    // await requireCourseManager();

    const { id } = await params;
    const subject = await getCourseSubjectById(id);

    return NextResponse.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    // await requireCourseManager();

    const { id } = await params;
    const body: unknown = await request.json();

    const parsed = updateCourseSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    const subject = await updateCourseSubject(id, parsed.data);

    return NextResponse.json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    // await requireCourseManager();

    const { id } = await params;
    const subject = await deleteCourseSubject(id);

    return NextResponse.json({
      success: true,
      data: subject,
      message: "Subject deleted successfully",
    });
  } catch (error) {
    return handleError(error);
  }
}
