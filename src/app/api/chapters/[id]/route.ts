import { NextRequest, NextResponse } from "next/server";

import { ChapterService } from "@/server/services/academic/chapter-service";
import { updateChapterSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const chapterService = new ChapterService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    const chapter = await chapterService.getChapterById(id);

    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: chapter,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/chapters/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authentication and authorization
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
    }

    // 2. Validate ID
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    // 3. Parse request body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    // 4. Validate input
    const validationResult = updateChapterSchema.safeParse(body);

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

    // 5. Update chapter
    const updatedChapter = await chapterService.updateChapter(
      id,
      validationResult.data,
    );

    if (!updatedChapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Chapter updated successfully",
        data: updatedChapter,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/chapters/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update chapter" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    // 1. Authentication and authorization
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
    }

    // 2. Validate ID
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Chapter ID is required" },
        { status: 400 },
      );
    }

    // 3. Check chapter exists
    const existingChapter = await chapterService.getChapterById(id);

    if (!existingChapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }

    // 4. Delete chapter
    await chapterService.deleteChapter(id);

    return NextResponse.json(
      {
        success: true,
        message: "Chapter deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/chapters/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete chapter" },
      { status: 500 },
    );
  }
}
