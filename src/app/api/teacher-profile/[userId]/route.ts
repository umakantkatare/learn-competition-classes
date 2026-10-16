import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import {
  getTeacherProfile,
  updateTeacherProfile,
  removeTeacherProfile,
} from "@/server/services/teacher-profile-service";

import { updateTeacherProfileSchema } from "@/validations/teacher-profile-validation";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user ?? null;
}

function canManageProfile(
  currentUser: { id: string; role?: string | null },
  targetUserId: string,
) {
  return currentUser.id === targetUserId || currentUser.role === "admin";
}

function handleProfileError(error: unknown) {
  if (error instanceof Error && error.message === "TEACHER_PROFILE_NOT_FOUND") {
    return NextResponse.json(
      { success: false, message: "Teacher profile not found" },
      { status: 404 },
    );
  }

  console.error("Teacher profile API error:", error);

  return NextResponse.json(
    { success: false, message: "Internal server error" },
    { status: 500 },
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    if (!canManageProfile(currentUser, userId)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const profile = await getTeacherProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleProfileError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    if (!canManageProfile(currentUser, userId)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const parsed = updateTeacherProfileSchema.safeParse(body);

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

    const profile = await updateTeacherProfile(userId, parsed.data);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleProfileError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { userId } = await params;

    if (!canManageProfile(currentUser, userId)) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const profile = await removeTeacherProfile(userId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return handleProfileError(error);
  }
}
