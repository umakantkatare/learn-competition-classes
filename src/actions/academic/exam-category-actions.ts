"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { ExamCategoryService } from "@/server/services/academic/exam-category-service";
import {
  createExamCategorySchema,
  updateExamCategorySchema,
} from "@/validations/academic/academic-validations";

const examCategoryService = new ExamCategoryService();

type ActionResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

async function requireAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Assumes your Better Auth user schema exposes a role field.
  return session?.user?.role === "ADMIN";
}

// 1. Create category
export async function createExamCategoryAction(
  formData: z.infer<typeof createExamCategorySchema>,
): Promise<ActionResult<unknown>> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createExamCategorySchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const category = await examCategoryService.createCategory(parsed.data);

    revalidatePath("/admin/exam-categories");

    return {
      success: true,
      data: category,
      message: "Exam category created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update category
export async function updateExamCategoryAction(
  id: string,
  formData: z.infer<typeof updateExamCategorySchema>,
): Promise<ActionResult<unknown>> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Category ID is required." };
    }

    const parsed = updateExamCategorySchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const category = await examCategoryService.updateCategory(id, parsed.data);

    revalidatePath("/admin/exam-categories");
    revalidatePath(`/admin/exam-categories/${id}`);

    return {
      success: true,
      data: category,
      message: "Exam category updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get categories
export async function getExamCategoriesAction(
  onlyActive = true,
): Promise<ActionResult<unknown[]>> {
  try {
    if (typeof onlyActive !== "boolean") {
      return { success: false, error: "Invalid filter." };
    }

    // Inactive categories are admin-only.
    if (!onlyActive && !(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    const categories = onlyActive
      ? await examCategoryService.getActiveCategories()
      : await examCategoryService.getAllCategories();

    return { success: true, data: categories };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Deactivate category
export async function deactivateExamCategoryAction(
  id: string,
): Promise<ActionResult<unknown>> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Category ID is required." };
    }

    const category = await examCategoryService.deactivateCategory(id);

    revalidatePath("/admin/exam-categories");
    revalidatePath("/");

    return {
      success: true,
      data: category,
      message: "Exam category deactivated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
