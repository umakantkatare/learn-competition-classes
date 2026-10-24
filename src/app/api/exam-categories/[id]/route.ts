import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ExamCategoryService } from "@/server/services/academic/exam-category-service";
import { updateExamCategorySchema } from "@/validations/academic/academic-validations";
import { requireAdminOrManager } from "@/lib/authorize";

const examCategoryService = new ExamCategoryService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: error.issues[0]?.message ?? "Invalid input.",
      },
      { status: 400 },
    );
  }

  console.error(fallback, error);

  return NextResponse.json(
    { success: false, error: fallback },
    { status: 500 },
  );
}

// GET /api/exam-categories/:id
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "ID is required." },
        { status: 400 },
      );
    }

    const category = await examCategoryService.getCategoryById(id);

    if (!category || !category.isActive) {
      return NextResponse.json(
        { success: false, error: "Exam category not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: category },
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(error, "Failed to fetch exam category.");
  }
}

// PATCH /api/exam-categories/:id
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

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "ID is required." },
        { status: 400 },
      );
    }

    const body: unknown = await req.json();
    const validationResult = updateExamCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 },
      );
    }

    const updatedCategory = await examCategoryService.updateCategory(
      id,
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Exam category updated successfully.",
        data: updatedCategory,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    return errorResponse(error, "Failed to update exam category.");
  }
}

// DELETE /api/exam-categories/:id
// Soft delete: deactivate the category.
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Authentication required."
              : "You do not have permission to deactivate exam categories.",
        },
        { status: access.status },
      );
    }

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "ID is required." },
        { status: 400 },
      );
    }

    // Prefer the dedicated service method if available.
    const deactivatedCategory =
      await examCategoryService.deactivateCategory(id);

    return NextResponse.json(
      {
        success: true,
        message: "Exam category deactivated successfully.",
        data: deactivatedCategory,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return errorResponse(error, "Failed to deactivate exam category.");
  }
}
