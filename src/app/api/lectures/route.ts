import { NextRequest, NextResponse } from "next/server";

import { LectureService } from "@/server/services/academic/lecture-service";
import { createLectureSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const lectureService = new LectureService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a chapterId query parameter",
        },
        { status: 400 },
      );
    }

    const lectures = await lectureService.getLecturesByChapter(chapterId);

    return NextResponse.json(
      {
        success: true,
        data: lectures,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/lectures error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lectures",
      },
      { status: 500 },
    );
  }
}

// ==========================================
// POST: Create a Lecture
// ADMIN / MANAGER only
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
        },
        { status: access.status },
      );
    }

    //  Parse JSON safely
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body",
        },
        { status: 400 },
      );
    }

    // 4. Validate lecture data
    // Includes any LIVE lecture refinements defined in the schema.
    const validationResult = createLectureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Invalid lecture data",
        },
        { status: 400 },
      );
    }

    // 5. Create lecture
    const newLecture = await lectureService.createLecture(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Lecture created successfully",
        data: newLecture,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/lectures error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create lecture",
      },
      { status: 500 },
    );
  }
}
