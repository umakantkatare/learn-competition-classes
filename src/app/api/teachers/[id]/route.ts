import { NextRequest, NextResponse } from "next/server";

import { TeacherService } from "@/server/services/academic/teacher-service";
import { updateTeacherProfileSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const teacherService = new TeacherService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch a teacher profile by ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const profile = await teacherService.getProfileById(id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/teachers/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch teacher profile" },
      { status: 500 },
    );
  }
}

// PATCH: Update a teacher profile
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const validationResult = updateTeacherProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid teacher profile data",
        },
        { status: 400 },
      );
    }

    const updatedProfile = await teacherService.updateProfile(
      id,
      validationResult.data,
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: "Teacher profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Teacher profile updated successfully",
        data: updatedProfile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/teachers/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update teacher profile" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a teacher profile, not the user account
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        { success: false, },
        { status: access.status },
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    await teacherService.deleteProfile(id);

    return NextResponse.json(
      {
        success: true,
        message: "Teacher profile deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/teachers/[id] error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to delete teacher profile" },
      { status: 500 },
    );
  }
}
