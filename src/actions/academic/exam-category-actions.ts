"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ExamCategoryService } from "@/server/services/academic/exam-category-service";
import { requireAdminOrManager } from "@/lib/authorize";

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
  status?: number;
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

function parseExamCategoryFormData(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const rawIsActive = rawData.isActive;

  return {
    ...rawData,
    isActive:
      rawIsActive === "true"
        ? true
        : rawIsActive === "false"
          ? false
          : rawIsActive,
  };
}

/**
 * Revalidate category pages used by both Admin and Manager.
 */
function revalidateExamCategoryPaths() {
  revalidatePath("/admin/exam-categories");
  revalidatePath("/manager/exam-categories");
}

/**
 * Create an exam category.
 * Accessible to Admin and Manager.
 */
export async function createExamCategoryAction(
  formData: FormData,
): Promise<ActionResult<unknown>> {
  try {
    const authorization = await requireAdminOrManager();

    if (!authorization.authorized) {
      return {
        success: false,
        error: authorization.error ?? "Authorization failed.",
        message: authorization.message,
        status: authorization.status,
      };
    }

    // Convert FormData values before validation.
    const rawData = parseExamCategoryFormData(formData);

    const parsed = createExamCategorySchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        status: 400,
      };
    }

    const category = await examCategoryService.createCategory(parsed.data);

    revalidateExamCategoryPaths();

    return {
      success: true,
      data: category,
      message: "Exam category created successfully.",
      status: 201,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Update an exam category.
 * Accessible to Admin and Manager.
 */
export async function updateExamCategoryAction(
  id: string,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  try {
    const authorization = await requireAdminOrManager();

    if (!authorization.authorized) {
      return {
        success: false,
        error: authorization.error ?? "Authorization failed.",
        message: authorization.message,
        status: authorization.status,
      };
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Exam category ID is required.",
        status: 400,
      };
    }

    // Convert FormData values before validation.
    const rawData = parseExamCategoryFormData(formData);

    const parsed = updateExamCategorySchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
        status: 400,
      };
    }

    const category = await examCategoryService.updateCategory(id, parsed.data);

    revalidateExamCategoryPaths();

    // Revalidate detail pages if these routes exist.
    revalidatePath(`/admin/exam-categories/${id}`);
    revalidatePath(`/manager/exam-categories/${id}`);

    return {
      success: true,
      data: category,
      message: "Exam category updated successfully.",
      status: 200,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Get exam categories.
 *
 * onlyActive = true:
 * Returns active categories.
 *
 * onlyActive = false:
 * Returns all categories and requires Admin or Manager authorization.
 */
export async function getExamCategoriesAction(
  onlyActive = true,
): Promise<ActionResult<unknown>> {
  try {
    if (typeof onlyActive !== "boolean") {
      return {
        success: false,
        error: "Invalid onlyActive value.",
        status: 400,
      };
    }

    if (!onlyActive) {
      const authorization = await requireAdminOrManager();

      if (!authorization.authorized) {
        return {
          success: false,
          error: authorization.error ?? "Authorization failed.",
          message: authorization.message,
          status: authorization.status,
        };
      }
    }

    const categories = onlyActive
      ? await examCategoryService.getActiveCategories()
      : await examCategoryService.getAllCategories();

    return {
      success: true,
      data: categories,
      status: 200,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: 500,
    };
  }
}

/**
 * Deactivate an exam category.
 * Accessible to Admin and Manager.
 */
export async function deactivateExamCategoryAction(
  id: string,
): Promise<ActionResult<unknown>> {
  try {
    const authorization = await requireAdminOrManager();

    if (!authorization.authorized) {
      return {
        success: false,
        error: authorization.error ?? "Authorization failed.",
        message: authorization.message,
        status: authorization.status,
      };
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Exam category ID is required.",
        status: 400,
      };
    }

    const result = await examCategoryService.deactivateCategory(id);

    revalidateExamCategoryPaths();

    // Revalidate the homepage if it displays exam categories.
    revalidatePath("/");

    return {
      success: true,
      data: result,
      message: "Exam category deactivated successfully.",
      status: 200,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
      status: 500,
    };
  }
}
