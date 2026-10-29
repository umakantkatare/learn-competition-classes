import { NextRequest, NextResponse } from "next/server";

import { ManagerService } from "@/server/services/academic/manager-service";
import { updateManagerProfileSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const managerService = new ManagerService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch a manager profile by ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Manager ID is required" },
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

    const profile = await managerService.getProfileById(id);

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile fetched successfully",
        data: profile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/managers/[id] error:", error);

    if (
      error instanceof Error &&
      error.message === "Manager profile not found."
    ) {
      return NextResponse.json(
        { success: false, error: "Manager profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch manager profile" },
      { status: 500 },
    );
  }
}

// PATCH: Update a manager profile
export async function PATCH(req: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Manager ID is required" },
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

    const validationResult = updateManagerProfileSchema.safeParse(body);

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

    if (Object.keys(validationResult.data).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one field is required to update the manager profile",
        },
        { status: 400 },
      );
    }

    const updatedProfile = await managerService.updateProfile(
      id,
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile updated successfully",
        data: updatedProfile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/managers/[id] error:", error);

    if (
      error instanceof Error &&
      error.message === "Manager profile not found."
    ) {
      return NextResponse.json(
        { success: false, error: "Manager profile not found" },
        { status: 404 },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "At least one field is required to update the manager profile."
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update manager profile" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a manager profile, not the user account
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
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

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Manager ID is required" },
        { status: 400 },
      );
    }

    await managerService.deleteProfile(id);

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile deleted successfully",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("DELETE /api/managers/[id] error:", error);

    if (
      error instanceof Error &&
      error.message === "Manager profile not found."
    ) {
      return NextResponse.json(
        { success: false, error: "Manager profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete manager profile" },
      { status: 500 },
    );
  }
}
