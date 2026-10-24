import { NextRequest, NextResponse } from "next/server";

import { ExaminationService } from "@/server/services/academic/examination-service";
import { createExaminationSchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const examinationService = new ExaminationService();

// GET: Fetch examinations, optionally filtered by category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "categoryId query parameter is required",
        },
        { status: 400 },
      );
    }

    const examinations =
      await examinationService.getExaminationsByCategory(categoryId);

    // Public API: return only active examinations.
    const activeExaminations = examinations.filter(
      (examination) => examination.isActive,
    );

    return NextResponse.json(
      {
        success: true,
        data: activeExaminations,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET /api/examinations error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch examinations",
      },
      { status: 500 },
    );
  }
}

// POST: Create an examination
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json({ success: false }, { status: access.status });
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

    const validationResult = createExaminationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid examination data",
        },
        { status: 400 },
      );
    }

    const newExamination = await examinationService.createExamination(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Examination created successfully",
        data: newExamination,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/examinations error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create examination",
      },
      { status: 500 },
    );
  }
}
