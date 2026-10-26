import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";
import { updateEnrollmentSchema } from "@/validations/academic/academic-validations";

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

function isAdminOrManager(role?: string | null) {
  return role === "admin" || role === "manager";
}

// ==========================================
// PATCH: Update Enrollment
// ADMIN / MANAGER only
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1. Authenticate.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    // 2. Authorize.
    if (!isAdminOrManager(session.user.role)) {
      return jsonError("You are not authorized to update enrollments.", 403);
    }

    // 3. Validate the enrollment ID.
    const { id } = await params;
    const enrollmentId = id?.trim();

    if (!enrollmentId || enrollmentId.length > 128) {
      return jsonError("Invalid enrollment ID.", 400);
    }

    // 4. Parse JSON safely.
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    // 5. Validate the update payload.
    const validationResult = updateEnrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ??
          "Invalid enrollment update data.",
        400,
      );
    }

    // 6. Update through the service.
    // The service must reject updates to REFUNDED enrollments
    // and must not allow unauthorized changes to payment state.
    const updatedEnrollment = await enrollmentService.updateEnrollment(
      enrollmentId,
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Enrollment updated successfully.",
        data: updatedEnrollment,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("[PATCH /api/enrollments/[id]] Update failed.", error);

    return jsonError("Failed to update enrollment.", 500);
  }
}
