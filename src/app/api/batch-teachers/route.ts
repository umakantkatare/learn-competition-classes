import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdminOrManager } from "@/lib/authorize";
import { BatchTeacherService } from "@/server/services/academic/batch-teacher-service";

import { idSchema } from "@/validations/academic/batch-validation";
import {
  assignBatchTeacherSchema,
  assignBatchTeachersSchema,
  removeBatchTeacherSchema,
} from "@/validations/academic/batch-teacher-validations";

const batchTeacherService = new BatchTeacherService();

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
};

const bulkAssignSchema = assignBatchTeachersSchema
  .extend({
    batchId: idSchema,
  })
  .superRefine(({ teacherIds }, ctx) => {
    if (teacherIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["teacherIds"],
        message: "At least one teacher ID is required",
      });
    }
  });

function validationError(error: z.ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: error.issues[0]?.message ?? "Invalid request data",
    },
    { status: 400, headers: NO_STORE_HEADERS },
  );
}

function authorizationError(
  access: Awaited<ReturnType<typeof requireAdminOrManager>>,
) {
  return NextResponse.json(
    {
      success: false,
      error: access.error,
      message: access.message,
    },
    { status: access.status, headers: NO_STORE_HEADERS },
  );
}

function serverError(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 500, headers: NO_STORE_HEADERS },
  );
}

// GET: Fetch teachers assigned to a batch OR batches assigned to a teacher
export async function GET(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return authorizationError(access);
    }

    const { searchParams } = new URL(req.url);

    const batchId = searchParams.get("batchId");
    const teacherId = searchParams.get("teacherId");

    if (batchId && teacherId) {
      return NextResponse.json(
        {
          success: false,
          error: "Provide either batchId or teacherId, not both",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (!batchId && !teacherId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide batchId or teacherId",
        },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const idResult = idSchema.safeParse(batchId ?? teacherId);

    if (!idResult.success) {
      return validationError(idResult.error);
    }

    if (batchId) {
      const teachers = await batchTeacherService.getTeachersForBatch(
        idResult.data,
      );

      return NextResponse.json(
        { success: true, data: teachers },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const batches = await batchTeacherService.getBatchesForTeacher(
      idResult.data,
    );

    return NextResponse.json(
      { success: true, data: batches },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[GET /api/batch-teachers]", error);
    return serverError("Failed to fetch assignments");
  }
}

// POST: Assign one or multiple teachers to a batch
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return authorizationError(access);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: NO_STORE_HEADERS },
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
        { status: 201, headers: NO_STORE_HEADERS },
      );
    }

    const validationResult = assignBatchTeacherSchema.safeParse(body);

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
      { status: 201, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[POST /api/batch-teachers]", error);
    return serverError("Failed to assign teacher(s)");
  }
}

// DELETE: Remove a teacher assignment from a batch
export async function DELETE(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return authorizationError(access);
    }

    const { searchParams } = new URL(req.url);

    const validationResult = removeBatchTeacherSchema.safeParse({
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
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    console.error("[DELETE /api/batch-teachers]", error);
    return serverError("Failed to remove teacher assignment");
  }
}
