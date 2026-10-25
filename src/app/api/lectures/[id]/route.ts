import { NextRequest, NextResponse } from "next/server";

import { LectureService } from "@/server/services/academic/lecture-service";
import { updateLectureSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const lectureService = new LectureService();

type RouteContext = {
  params: Promise<{ id: string }>;
};


// ==========================================
// GET: Fetch a Lecture by ID
// ==========================================
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Lecture ID is required" },
        { status: 400 },
      );
    }

    const lecture = await lectureService.getLectureById(id);

    if (!lecture) {
      return NextResponse.json(
        { success: false, error: "Lecture not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: lecture,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/lectures/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch lecture" },
      { status: 500 },
    );
  }
}

// ==========================================
// PATCH: Update a Lecture
// ADMIN / MANAGER only
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  try {
    // 1. Authentication and authorization
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        { success: false, },
        { status: access.status },
      );
    }

    // 2. Validate ID
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Lecture ID is required" },
        { status: 400 },
      );
    }

    // 3. Parse JSON safely
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    // 4. Validate lecture data
    // Runs the refinements defined in updateLectureSchema.
    const validationResult = updateLectureSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid lecture data",
        },
        { status: 400 },
      );
    }

    // 5. Update lecture
    const updatedLecture = await lectureService.updateLecture(
      id,
      validationResult.data,
    );

    if (!updatedLecture) {
      return NextResponse.json(
        { success: false, error: "Lecture not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lecture updated successfully",
        data: updatedLecture,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PATCH /api/lectures/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update lecture" },
      { status: 500 },
    );
  }
}

// ==========================================
// DELETE: Delete a Lecture
// ADMIN / MANAGER only
// ==========================================
export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext,
) {
  try {
    // 1. Authentication and authorization
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        { success: false,  },
        { status: access.status },
      );
    }

    // 2. Validate ID
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Lecture ID is required" },
        { status: 400 },
      );
    }

    // 3. Check whether lecture exists
    const existingLecture = await lectureService.getLectureById(id);

    if (!existingLecture) {
      return NextResponse.json(
        { success: false, error: "Lecture not found" },
        { status: 404 },
      );
    }

    // 4. Delete lecture
    await lectureService.deleteLecture(id);

    return NextResponse.json(
      {
        success: true,
        message: "Lecture deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/lectures/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete lecture" },
      { status: 500 },
    );
  }
}
