import { NextRequest, NextResponse } from "next/server";

import { ManagerService } from "@/server/services/academic/manager-service";
import { createManagerProfileSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const managerService = new ManagerService();

// GET: Fetch a specific manager profile or all manager profiles
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Fetch a specific manager profile by user ID
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

      const profile = await managerService.getProfileByUserId(userId);

      return NextResponse.json(
        {
          success: true,
          message: "Manager profile fetched successfully",
          data: profile,
        },
        { status: 200 },
      );
    }

    // Fetch all manager profiles (Admin/Manager only)
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

    const managers = await managerService.getAllManagers();

    if (managers.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: "No managers found",
          count: 0,
          data: [],
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Managers fetched successfully",
        count: managers.length,
        data: managers,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/managers error:", error);

    if (
      error instanceof Error &&
      error.message === "Manager profile not found for this user."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch manager profiles",
      },
      { status: 500 },
    );
  }
}

// POST: Create a manager profile (Admin/Manager only)
export async function POST(req: NextRequest) {
  try {
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

    const validationResult = createManagerProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid manager profile data",
        },
        { status: 400 },
      );
    }

    const newProfile = await managerService.createProfile(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile created successfully",
        data: newProfile,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/managers error:", error);

    if (
      error instanceof Error &&
      error.message === "A manager profile already exists for this user."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create manager profile",
      },
      { status: 500 },
    );
  }
}
