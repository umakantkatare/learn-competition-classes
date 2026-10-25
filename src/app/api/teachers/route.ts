import { NextRequest, NextResponse } from "next/server";

import { TeacherService } from "@/server/services/academic/teacher-service";
import { createTeacherProfileSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const teacherService = new TeacherService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // CASE 1: Fetch a specific teacher profile
    if (userId) {
      const profile = await teacherService.getProfileByUserId(userId);

      if (!profile) {
        return NextResponse.json(
          {
            success: false,
            error: "Teacher profile not found",
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Teacher profile fetched successfully",
          data: profile,
        },
        { status: 200 },
      );
    }

    // CASE 2: Fetch all teachers (Admin/Manager only)
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized access",
        },
        { status: access.status },
      );
    }

    const teachers = await teacherService.getAllTeachers();

    return NextResponse.json(
      {
        success: true,
        message: "Teachers fetched successfully",
        count: teachers.length,
        data: teachers,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/teachers error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch teachers",
      },
      { status: 500 },
    );
  }
}

// POST: Create a teacher profile
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

    const validationResult = createTeacherProfileSchema.safeParse(body);

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

    const newProfile = await teacherService.createProfile(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Teacher profile created successfully",
        data: newProfile,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/teachers error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create teacher profile",
      },
      { status: 500 },
    );
  }
}
