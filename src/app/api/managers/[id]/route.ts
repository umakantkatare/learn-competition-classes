import { NextRequest, NextResponse } from "next/server";

import { AuthorizationError, getSession, requireAdmin } from "@/lib/authorize";

import { ManagerService } from "@/server/services/academic/manager-service";

import { updateManagerProfileSchema } from "@/validations/academic/manager-validations";

const managerService = new ManagerService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

function handleRouteError(error: unknown) {
  if (error instanceof AuthorizationError) {
    const status = error.code === "UNAUTHORIZED" ? 401 : 403;

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status },
    );
  }

  if (error instanceof Error) {
    if (
      error.message === "Manager profile not found." ||
      error.message === "Manager profile not found for this user."
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Manager profile not found.",
        },
        { status: 404 },
      );
    }
  }

  console.error("Manager profile route error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred.",
    },
    { status: 500 },
  );
}

/**
 * GET /api/managers/[id]
 *
 * Admin: Can fetch any manager profile.
 * Manager: Can fetch only their own profile.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Manager profile ID is required.",
        },
        { status: 400 },
      );
    }

    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication is required.",
        },
        { status: 401 },
      );
    }

    const profile = await managerService.getProfileById(id);

    const isAdmin = session.user.role === "admin";
    const isOwner = profile.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot access this manager profile.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile fetched successfully.",
        data: profile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}

/**
 * PATCH /api/managers/[id]
 *
 * Admin only.
 * Updates administrative manager-profile fields,
 * such as employeeCode.
 */
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Manager profile ID is required.",
        },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
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
            "Invalid manager profile data.",
        },
        { status: 400 },
      );
    }

    const updatedProfile = await managerService.updateManagerProfile(
      id,
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile updated successfully.",
        data: updatedProfile,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message ===
        "At least one field is required to update the manager profile."
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 400 },
        );
      }

      // Adapt this condition to the exact duplicate-code
      // error message emitted by your service.
      if (
        error.message.toLowerCase().includes("employee code") &&
        error.message.toLowerCase().includes("already")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          { status: 409 },
        );
      }
    }

    return handleRouteError(error);
  }
}

/**
 * DELETE /api/managers/[id]
 *
 * Admin only.
 *
 * Deletes the manager profile only.
 * Does not delete or deactivate the Better Auth user.
 */
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Manager profile ID is required.",
        },
        { status: 400 },
      );
    }

    await managerService.deleteProfile(id);

    return NextResponse.json(
      {
        success: true,
        message: "Manager profile deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
