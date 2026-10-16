import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import {
  createTeacherProfile,
  getTeacherProfile,
} from "@/server/services/teacher-profile-service";

import { createTeacherProfileSchema } from "@/validations/teacher-profile-validation";

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const profile = await getTeacherProfile(currentUser.id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TEACHER_PROFILE_NOT_FOUND"
    ) {
      return NextResponse.json(
        { success: false, message: "Teacher profile not found" },
        { status: 404 },
      );
    }

    console.error("GET /api/teacher-profile:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: unknown = await request.json();

    const parsed = createTeacherProfileSchema
      .omit({ userId: true })
      .safeParse(body);

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

    const profile = await createTeacherProfile({
      ...parsed.data,
      userId: currentUser.id,
    });

    return NextResponse.json({ success: true, data: profile }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "TEACHER_PROFILE_ALREADY_EXISTS"
    ) {
      return NextResponse.json(
        { success: false, message: "Teacher profile already exists" },
        { status: 409 },
      );
    }

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    console.error("POST /api/teacher-profile:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
