import { NextRequest, NextResponse } from "next/server";
import { ExaminationService } from "@/server/services/academic/examination-service";
import { updateExaminationSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const examinationService = new ExaminationService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// GET: Fetch examination by ID
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const examination = await examinationService.getExaminationById(id);

    if (!examination) {
      return NextResponse.json(
        { success: false, error: "Examination not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: examination,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, "Failed to fetch examination"),
      },
      { status: 500 },
    );
  }
}

// PATCH: Update examination
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Authentication required."
              : "You do not have permission to update exam categories.",
        },
        { status: access.status },
      );
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const body: unknown = await req.json();

    const validationResult = updateExaminationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Validation failed",
        },
        { status: 400 },
      );
    }

    const updatedExamination = await examinationService.updateExamination(
      id,
      validationResult.data,
    );

    if (!updatedExamination) {
      return NextResponse.json(
        { success: false, error: "Examination not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Examination updated successfully",
        data: updatedExamination,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, "Failed to update examination"),
      },
      { status: 500 },
    );
  }
}

// DELETE: Soft delete (deactivate) examination
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Authentication required."
              : "You do not have permission to update exam categories.",
        },
        { status: access.status },
      );
    }
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID is required" },
        { status: 400 },
      );
    }

    const deactivatedExamination = await examinationService.updateExamination(
      id,
      { isActive: false },
    );

    if (!deactivatedExamination) {
      return NextResponse.json(
        { success: false, error: "Examination not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Examination deactivated successfully",
        data: deactivatedExamination,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, "Failed to deactivate examination"),
      },
      { status: 500 },
    );
  }
}
