"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ExaminationService } from "@/server/services/academic/examination-service";
import {
  createExaminationSchema,
  updateExaminationSchema,
} from "@/validations/academic/academic-validations";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireAdminOrManager } from "@/lib/authorize";

const examinationService = new ExaminationService();

type ActionResult<T = unknown> = {
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

// 1. Create Examination
export async function createExaminationAction(
  formData: z.infer<typeof createExaminationSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createExaminationSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const examination = await examinationService.createExamination(parsed.data);

    revalidatePath("/admin/examinations");
    revalidatePath(`/admin/exam-categories/${parsed.data.categoryId}`);

    return {
      success: true,
      data: examination,
      message: "Examination created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// get examination with category fields
export async function getAllExaminationsAction(): Promise<ActionResult> {
  try {
    const examinations = await examinationService.getAllExaminations();

    return { success: true, data: examinations };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Examination
export async function updateExaminationAction(
  id: string,
  formData: z.infer<typeof updateExaminationSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Examination ID is required." };
    }

    const parsed = updateExaminationSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const examination = await examinationService.updateExamination(
      id,
      parsed.data,
    );

    revalidatePath("/admin/examinations");
    revalidatePath(`/admin/examinations/${id}`);

    return {
      success: true,
      data: examination,
      message: "Examination updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get Examinations by Category
export async function getExaminationsByCategoryAction(
  categoryId: string,
): Promise<ActionResult> {
  try {
    if (!categoryId?.trim()) {
      return { success: false, error: "Category ID is required." };
    }

    // This method must return only active examinations for public use.
    const examinations =
      await examinationService.getExaminationsByCategory(categoryId);

    return { success: true, data: examinations };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Examination by Slug
export async function getExaminationBySlugAction(
  slug: string,
): Promise<ActionResult> {
  try {
    if (!slug?.trim()) {
      return { success: false, error: "Examination slug is required." };
    }

    const examination = await examinationService.getExaminationBySlug(slug);

    return { success: true, data: examination };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Deactivate Examination
export async function deactivateExaminationAction(
  id: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Examination ID is required." };
    }

    const examination = await examinationService.deactivateExamination(id);

    revalidatePath("/admin/examinations");
    revalidatePath(`/admin/examinations/${id}`);

    return {
      success: true,
      data: examination,
      message: "Examination deactivated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
