"use server";

import { revalidatePath } from "next/cache";

import {
  createExam,
  setExamStatus,
  updateExam,
} from "@/services/academic/exam/mutations";

import {
  createExamSchema,
  updateExamSchema,
} from "@/validations/academic/exam/exam-validation";
import { requireAcademicWriteAccess } from "@/lib/authorization/academic";


function isUniqueConstraintError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "23505";
}

export async function createExamAction(input: unknown) {
  await requireAcademicWriteAccess();

  const parsed = createExamSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid exam data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const exam = await createExam(parsed.data);

    revalidatePath("/academic/exams");

    return {
      success: true,
      data: exam,
    };
  } catch (error) {
    console.error("Create exam error:", error);

    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "An exam with this slug and year already exists.",
        fieldErrors: {
          slug: ["An exam with this slug and year already exists."],
        },
      };
    }

    return {
      success: false,
      error: "Unable to create exam.",
    };
  }
}

export async function updateExamAction(id: string, input: unknown) {
  await requireAcademicWriteAccess();

  const parsed = updateExamSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid exam data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const exam = await updateExam(id, parsed.data);

    if (!exam) {
      return {
        success: false,
        error: "Exam not found.",
      };
    }

    revalidatePath("/academic/exams");
    revalidatePath(`/academic/exams/${id}`);

    return {
      success: true,
      data: exam,
    };
  } catch (error) {
    console.error("Update exam error:", error);

    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "An exam with this slug and year already exists.",
        fieldErrors: {
          slug: ["An exam with this slug and year already exists."],
        },
      };
    }

    return {
      success: false,
      error: "Unable to update exam.",
    };
  }
}

export async function setExamStatusAction(id: string, isActive: boolean) {
  await requireAcademicWriteAccess();

  try {
    const exam = await setExamStatus(id, isActive);

    if (!exam) {
      return {
        success: false,
        error: "Exam not found.",
      };
    }

    revalidatePath("/academic/exams");
    revalidatePath(`/academic/exams/${id}`);

    return {
      success: true,
      data: exam,
    };
  } catch (error) {
    console.error("Update exam status error:", error);

    return {
      success: false,
      error: "Unable to update exam status.",
    };
  }
}
