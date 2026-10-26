import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { BatchTeacherService } from "@/server/services/academic/batch-teacher-service";
import { batchTeacherSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const batchTeacherService = new BatchTeacherService();

const bulkAssignSchema = z.object({
  batchId: z.string().trim().min(1, "Batch ID is required"),
    teacherIds: z
        .array(z.string().trim().min(1, "Teacher ID cannot be empty"))
        .min(1, "At least one Teacher ID is required")
    .refine(
      (teacherIds) => new Set(teacherIds).size === teacherIds.length,
      "Duplicate Teacher IDs are not allowed",
    ),
});

function validationError(error: z.ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: error.issues[0]?.message ?? "Invalid request data",
    },
    { status: 400 },
  );
}

// GET: Fetch teachers assigned to a batch OR batches assigned to a teacher
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const teacherId = searchParams.get("teacherId");

    if (batchId && teacherId) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide either batchId or teacherId, not both",
        },
        { status: 400 },
      );
    }

    if (batchId) {
      const teachers = await batchTeacherService.getTeachersForBatch(batchId);

      return NextResponse.json(
        { success: true, data: teachers },
        { status: 200 },
      );
    }

    if (teacherId) {
      const batches = await batchTeacherService.getBatchesForTeacher(teacherId);

      return NextResponse.json(
        { success: true, data: batches },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Please provide batchId or teacherId",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[GET /api/batch-teachers]", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 },
    );
  }
}

// POST: Assign one or multiple teachers to a batch
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
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    if (typeof body === "object" && body !== null && "teacherIds" in body) {
      const validationResult = bulkAssignSchema.safeParse(body);

      if (!validationResult.success) {
        return validationError(validationResult.error);
      }

      const { batchId, teacherIds } = validationResult.data;

      const assignments = await batchTeacherService.assignMultipleTeachers(
        batchId,
        teacherIds,
      );

      return NextResponse.json(
        {
          success: true,
          message: `${assignments.length} teacher(s) assigned successfully`,
          data: assignments,
        },
        { status: 201 },
      );
    }

    const validationResult = batchTeacherSchema.safeParse(body);

    if (!validationResult.success) {
      return validationError(validationResult.error);
    }

    const { batchId, teacherId } = validationResult.data;

    const assignment = await batchTeacherService.assignTeacherToBatch(
      batchId,
      teacherId,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Teacher assigned to batch successfully",
        data: assignment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/batch-teachers]", error);

    return NextResponse.json(
      { success: false, error: "Failed to assign teacher(s)" },
      { status: 500 },
    );
  }
}

// DELETE: Remove a teacher assignment from a batch
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    const validationResult = batchTeacherSchema.safeParse({
      batchId: searchParams.get("batchId"),
      teacherId: searchParams.get("teacherId"),
    });

    if (!validationResult.success) {
      return validationError(validationResult.error);
    }

    const { batchId, teacherId } = validationResult.data;

    await batchTeacherService.removeTeacherFromBatch(batchId, teacherId);

    return NextResponse.json(
      {
        success: true,
        message: "Teacher removed from batch successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/batch-teachers]", error);

    return NextResponse.json(
      { success: false, error: "Failed to remove teacher assignment" },
      { status: 500 },
    );
  }
}
