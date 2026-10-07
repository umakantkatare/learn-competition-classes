"use server";

import { revalidatePath } from "next/cache";

import {
  createSubject,
  setSubjectStatus,
  updateSubject,
} from "@/services/academic/subject/mutations";

import { requireAcademicWriteAccess } from "@/lib/authorization/academic";

import {
  createSubjectSchema,
  updateSubjectSchema,
} from "@/validations/academic/subject/subject-validation";

function isUniqueConstraintError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  return error.code === "23505";
}

export async function createSubjectAction(input: unknown) {
  await requireAcademicWriteAccess();

  const parsed = createSubjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid subject data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const subject = await createSubject(parsed.data);

    revalidatePath("/academic/subjects");

    return {
      success: true,
      data: subject,
    };
  } catch (error) {
    console.error("Create subject error:", error);

    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A subject with this slug already exists.",
        fieldErrors: {
          slug: ["A subject with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      error: "Unable to create subject.",
    };
  }
}

export async function updateSubjectAction(id: string, input: unknown) {
  await requireAcademicWriteAccess();

  const parsed = updateSubjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid subject data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const subject = await updateSubject(id, parsed.data);

    if (!subject) {
      return {
        success: false,
        error: "Subject not found.",
      };
    }

    revalidatePath("/academic/subjects");
    revalidatePath(`/academic/subjects/${id}`);

    return {
      success: true,
      data: subject,
    };
  } catch (error) {
    console.error("Update subject error:", error);

    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        error: "A subject with this slug already exists.",
        fieldErrors: {
          slug: ["A subject with this slug already exists."],
        },
      };
    }

    return {
      success: false,
      error: "Unable to update subject.",
    };
  }
}

export async function setSubjectStatusAction(id: string, isActive: boolean) {
  await requireAcademicWriteAccess();

  try {
    const subject = await setSubjectStatus(id, isActive);

    if (!subject) {
      return {
        success: false,
        error: "Subject not found.",
      };
    }

    revalidatePath("/academic/subjects");
    revalidatePath(`/academic/subjects/${id}`);

    return {
      success: true,
      data: subject,
    };
  } catch (error) {
    console.error("Update subject status error:", error);

    return {
      success: false,
      error: "Unable to update subject status.",
    };
  }
}
