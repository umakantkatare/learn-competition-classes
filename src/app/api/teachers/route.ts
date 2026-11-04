import { NextRequest, NextResponse } from "next/server";

import { TeacherService } from "@/server/services/academic/teacher-service";
import { requireAdminOrManager } from "@/lib/authorize";
import { createTeacherAuthUser } from "@/helper/createTeacherAuthUser";
import { headers } from "next/headers";
import { createTeacherSchema } from "@/validations/academic/teacher-validations";

const teacherService = new TeacherService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    //  Fetch a specific teacher profile
    if (userId !== null) {
      if (!userId.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "userId cannot be empty",
          },
          { status: 400 },
        );
      }

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

    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin or Manager access required",
        },
        { status: access.status },
      );
    }

    const teachers = await teacherService.getAllTeachers();

    if (!teachers || teachers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No teachers found",
        },
        { status: 404 },
      );
    }

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
    if (error instanceof Error) {
      console.error(error.message);
    }
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
    const requestHeaders = await headers();

    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Admin or Manager access required",
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

    const validationResult = createTeacherSchema.safeParse(body);

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
      {
        createAuthUser: (input) =>
          createTeacherAuthUser({
            ...input,
            headers: requestHeaders,
          }),
      },
    );

    console.log("New teacher profile created:", newProfile);

    return NextResponse.json(
      {
        success: true,
        message: "Teacher profile created successfully",
        data: newProfile,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    }
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
