import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { ExamCategoryService } from "@/server/services/academic/exam-category-service";
import { createExamCategorySchema } from "@/validations/academic/academic-validations";

const examCategoryService = new ExamCategoryService();

async function requireAdminOrManager() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return { authorized: false, status: 401 as const };
  }

  if (!["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return { authorized: false, status: 403 as const };
  }

  return { authorized: true, status: 200 as const };
}

// GET /api/exam-categories?activeOnly=true
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("activeOnly") !== "false";

    // Public endpoint: only active categories.
    // If activeOnly=false is requested, require admin/manager.
    if (!activeOnly) {
      const access = await requireAdminOrManager();

      if (!access.authorized) {
        return NextResponse.json(
          {
            success: false,
            error:
              access.status === 401
                ? "Authentication required."
                : "You do not have permission to view inactive categories.",
          },
          { status: access.status },
        );
      }
    }

    // Keep active-only behavior until the service's all-category
    // method is confirmed.
    const categories = await examCategoryService.getActiveCategories();

    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("GET exam categories failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch exam categories.",
      },
      { status: 500 },
    );
  }
}

// POST /api/exam-categories
export async function POST(req: NextRequest) {
  try {
    const access = await requireAdminOrManager();

    if (!access.authorized) {
      return NextResponse.json(
        {
          success: false,
          error:
            access.status === 401
              ? "Authentication required."
              : "You do not have permission to create exam categories.",
        },
        { status: access.status },
      );
    }

    const body: unknown = await req.json();
    const validationResult = createExamCategorySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 },
      );
    }

    const newCategory = await examCategoryService.createCategory(
      validationResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Exam category created successfully.",
        data: newCategory,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body." },
        { status: 400 },
      );
    }

    console.error("POST exam category failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create exam category.",
      },
      { status: 500 },
    );
  }
}
