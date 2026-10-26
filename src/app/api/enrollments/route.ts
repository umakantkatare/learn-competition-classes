import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";
import { createEnrollmentSchema } from "@/validations/academic/academic-validations";

const enrollmentService = new EnrollmentService();

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

function isAdminOrManager(role?: string | null) {
  return role === "admin" || role === "manager";
}

// ==========================================
// GET: Fetch Enrollments
// ==========================================
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    const requestedUserId = req.nextUrl.searchParams.get("userId")?.trim();

    // Default to the authenticated user's enrollments.
    const targetUserId = requestedUserId || session.user.id;

    // Users cannot inspect another user's enrollment records.
    if (
      targetUserId !== session.user.id &&
      !isAdminOrManager(session.user.role)
    ) {
      return jsonError(
        "You are not authorized to view these enrollments.",
        403,
      );
    }

    if (targetUserId.length > 128) {
      return jsonError("Invalid userId.", 400);
    }

    const enrollments =
      await enrollmentService.getUserEnrollments(targetUserId);

    return NextResponse.json(
      {
        success: true,
        data: enrollments,
      },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("[GET /api/enrollments] Failed to fetch enrollments.", error);

    return jsonError("Failed to fetch enrollments.", 500);
  }
}

// ==========================================
// POST: Manually Enroll a Student
// Admin/Manager only
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    // Manual enrollment must not be available to ordinary students.
    if (!isAdminOrManager(session.user.role)) {
      return jsonError("You are not authorized to create enrollments.", 403);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const validationResult = createEnrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ?? "Invalid enrollment data.",
        400,
      );
    }

    const { userId, batchId, orderId } = validationResult.data;

    if (
      !userId.trim() ||
      !batchId.trim() ||
      userId.length > 128 ||
      batchId.length > 128
    ) {
      return jsonError("Invalid userId or batchId.", 400);
    }

    // The service must verify batch eligibility and, for paid batches,
    // require a valid paid order. Never trust an orderId by itself.
    const enrollment = await enrollmentService.enrollStudent(
      userId,
      batchId,
      orderId || undefined,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Student enrolled successfully.",
        data: enrollment,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error(
      "[POST /api/enrollments] Failed to create enrollment.",
      error,
    );

    return jsonError("Failed to create enrollment.", 500);
  }
}
