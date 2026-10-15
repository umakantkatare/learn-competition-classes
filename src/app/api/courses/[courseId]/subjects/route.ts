import { NextResponse } from "next/server";

import { createCourseSubjectSchema } from "@/validations/courses/course-subject-schema";
import { createCourseSubject } from "@/server/services/course-subject-service";
import { findPublishedSubjectsByCourseId } from "@/server/repositories/course-subject-repository";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message === "UNAUTHORIZED"
      ? 401
      : message === "FORBIDDEN"
        ? 403
        : message === "Course not found" || message === "Subject not found"
          ? 404
          : 400;

  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { courseId } = await params;

    // Public endpoint: unpublished subjects are never returned.
    const subjects = await findPublishedSubjectsByCourseId(courseId);

    return NextResponse.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return handleError(error);
  }
}

// export async function POST(request: Request, { params }: RouteContext) {
//   try {
//     // await requireCourseManager();

//     const { courseId } = await params;
//     const body: unknown = await request.json();

//     const parsed = createCourseSubjectSchema.safeParse({
//       ...(typeof body === "object" && body !== null ? body : {}),
//       courseId,
//     });

//     if (!parsed.success) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Validation failed",
//           errors: parsed.error.flatten(),
//         },
//         { status: 422 },
//       );
//     }

//     const subject = await createCourseSubject(parsed.data);

//     return NextResponse.json({ success: true, data: subject }, { status: 201 });
//   } catch (error) {
//     return handleError(error);
//   }
// }
export async function POST(request: Request, { params }: RouteContext) {
  try {
    console.log("[POST /course-subject] Request received");

    // await requireCourseManager();

    const { courseId } = await params;
    console.log("[POST /course-subject] Course ID:", courseId);

    const body: unknown = await request.json();
    console.log("[POST /course-subject] Request body:", body);

    const parsed = createCourseSubjectSchema.safeParse({
      ...(typeof body === "object" && body !== null ? body : {}),
      courseId,
    });

    if (!parsed.success) {
      console.error(
        "[POST /course-subject] Validation failed:",
        parsed.error.flatten(),
      );

      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 422 },
      );
    }

    // Normalize optional teacherId before database insertion.
    const data = {
      ...parsed.data,
      teacherId:
        typeof parsed.data.teacherId === "string"
          ? parsed.data.teacherId.trim() || null
          : parsed.data.teacherId,
    };

    console.log("[POST /course-subject] Validated data:", data);
    console.log("[POST /course-subject] Creating course subject...");

    const subject = await createCourseSubject(data);

    console.log("[POST /course-subject] Subject created:", subject);

    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error("[POST /course-subject] Error occurred:", error);

    if (error instanceof Error) {
      console.error("[POST /course-subject] Error message:", error.message);
      console.error("[POST /course-subject] Stack trace:", error.stack);
    }

    return handleError(error);
  }
}
