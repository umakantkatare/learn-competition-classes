import { NextRequest, NextResponse } from "next/server";

import { ChapterService } from "@/server/services/academic/chapter-service";
import { createChapterSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const chapterService = new ChapterService();

// ==========================================
// GET: Fetch Chapters by Subject
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    if (!subjectId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a subjectId query parameter",
        },
        { status: 400 },
      );
    }

    const chapters = await chapterService.getChaptersBySubject(subjectId);

    if (!chapters) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapters not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: chapters,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chapters",
      },
      { status: 500 },
    );
  }
}

// ==========================================
// POST: Create a Chapter
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

    // 3. Parse JSON safely
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

    // 4. Validate request body
    const validationResult = createChapterSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Invalid chapter data",
        },
        { status: 400 },
      );
    }

    // 5. Create chapter
    const newChapter = await chapterService.createChapter(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Chapter created successfully",
        data: newChapter,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/chapters error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create chapter",
      },
      { status: 500 },
    );
  }
}
