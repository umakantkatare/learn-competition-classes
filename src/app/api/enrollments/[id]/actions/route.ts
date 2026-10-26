import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";

const enrollmentService = new EnrollmentService();

const enrollmentActionSchema = z
  .object({
    action: z.enum(["REVOKE", "EXTEND"]),
    extraMonths: z.number().int().min(1).max(24).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.action === "EXTEND" && data.extraMonths === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "extraMonths is required when extending validity.",
        path: ["extraMonths"],
      });
    }

    if (data.action === "REVOKE" && data.extraMonths !== undefined) {
      ctx.addIssue({
        code: "custom",
        message: "extraMonths is not allowed when revoking enrollment.",
        path: ["extraMonths"],
      });
    }
  });

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

// POST: Revoke or Extend Enrollment

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    if (!isAdminOrManager(session.user.role)) {
      return jsonError("You are not authorized to modify enrollments.", 403);
    }

    const { id } = await params;
    const enrollmentId = id?.trim();

    if (!enrollmentId || enrollmentId.length > 128) {
      return jsonError("Invalid enrollment ID.", 400);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const validationResult = enrollmentActionSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ??
          "Invalid enrollment action.",
        400,
      );
    }

    const { action, extraMonths } = validationResult.data;

    const result =
      action === "REVOKE"
        ? await enrollmentService.revokeEnrollment(enrollmentId)
        : await enrollmentService.extendValidity(enrollmentId, extraMonths!);

    return NextResponse.json(
      {
        success: true,
        message:
          action === "REVOKE"
            ? "Enrollment revoked successfully."
            : "Enrollment validity extended successfully.",
        data: result,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("[POST /api/enrollments/[id]/actions] Action failed.", error);

    return jsonError("Failed to process enrollment action.", 500);
  }
}
