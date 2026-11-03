import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { AuthorizationError, getSession, requireAdmin } from "@/lib/authorize";

import { ManagerService } from "@/server/services/academic/manager-service";

import { createManagerSchema } from "@/validations/academic/manager-validations";
import { createManagerAuthUser } from "@/helper/createManagerAuthUser";

const managerService = new ManagerService();

function handleError(error: unknown) {
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      {
        status: error.code === "UNAUTHORIZED" ? 401 : 403,
      },
    );
  }

  if (error instanceof Error) {
    if (
      error.message === "Manager profile not found for this user." ||
      error.message === "Manager profile not found."
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 },
      );
    }
  }

  console.error("Managers API error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred.",
    },
    { status: 500 },
  );
}

/**
 * GET /api/managers
 * GET /api/managers?userId=<userId>
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication is required." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const isAdmin = session.user.role === "admin";
    const isManager = session.user.role === "manager";

    if (!isAdmin && !isManager) {
      return NextResponse.json(
        { success: false, error: "Access denied." },
        { status: 403 },
      );
    }

    if (userId !== null) {
      if (!userId.trim()) {
        return NextResponse.json(
          { success: false, error: "userId cannot be empty." },
          { status: 400 },
        );
      }

      if (!isAdmin && userId !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "You cannot access another manager's profile.",
          },
          { status: 403 },
        );
      }

      const profile = await managerService.getProfileByUserId(userId);

      return NextResponse.json(
        {
          success: true,
          message: "Manager profile fetched successfully.",
          data: profile,
        },
        { status: 200 },
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Only administrators can fetch all managers.",
        },
        { status: 403 },
      );
    }

    const managers = await managerService.getAllManagers();

    return NextResponse.json(
      {
        success: true,
        message: managers.length
          ? "Managers fetched successfully."
          : "No managers found.",
        count: managers.length,
        data: managers,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleError(error);
  }
}

/**
 * POST /api/managers
 *
 * Creates a Better Auth user and manager profile.
 * Admin only. Email OTP verification is not required.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const parsed = createManagerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid manager details.",
        },
        { status: 400 },
      );
    }

    const requestHeaders = await headers();

    const assertEmailAvailable = async (_email: string): Promise<void> => {
      throw new Error("Email availability check is not connected.");
    };

    const result = await managerService.createManager(parsed.data, {
      createAuthUser: async (input) =>
        createManagerAuthUser({
          ...input,
          headers: requestHeaders,
        }),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Manager created successfully.",
        data: result,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message === "Email availability check is not connected."
    ) {
      console.error("Manager provisioning configuration error:", error);

      return NextResponse.json(
        {
          success: false,
          error: "Manager provisioning dependencies are not configured.",
          code: "MANAGER_PROVISIONING_NOT_CONFIGURED",
        },
        { status: 501 },
      );
    }

    return handleError(error);
  }
}
