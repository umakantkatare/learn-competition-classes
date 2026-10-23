"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { SubjectService } from "@/server/services/academic/subject-service";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "@/validations/academic/academic-validations";

const subjectService = new SubjectService();

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

async function requireAdminOrManager(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return ["ADMIN", "MANAGER"].includes(session?.user?.role ?? "");
}

// 1. Create Subject
export async function createSubjectAction(
  formData: z.infer<typeof createSubjectSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createSubjectSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const subject = await subjectService.createSubject(parsed.data);

    revalidatePath("/admin/subjects");
    revalidatePath("/admin/chapters");
    revalidatePath("/admin/lectures");

    return {
      success: true,
      data: subject,
      message: "Subject created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Subject
export async function updateSubjectAction(
  id: string,
  formData: z.infer<typeof updateSubjectSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Subject ID is required." };
    }

    const parsed = updateSubjectSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const subject = await subjectService.updateSubject(id, parsed.data);

    revalidatePath("/admin/subjects");
    revalidatePath(`/admin/subjects/${id}`);
    revalidatePath("/admin/chapters");
    revalidatePath("/admin/lectures");

    return {
      success: true,
      data: subject,
      message: "Subject updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get All Subjects — Admin/Manager
export async function getAllSubjectsAction(): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const subjects = await subjectService.getAllSubjects();

    return { success: true, data: subjects };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Subject by ID — Admin/Manager
export async function getSubjectByIdAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Subject ID is required." };
    }

    const subject = await subjectService.getSubjectById(id);

    return { success: true, data: subject };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
