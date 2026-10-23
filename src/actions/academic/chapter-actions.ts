"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { ChapterService } from "@/server/services/academic/chapter-service";
import {
  createChapterSchema,
  updateChapterSchema,
} from "@/validations/academic/academic-validations";

const chapterService = new ChapterService();

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

// 1. Create Chapter
export async function createChapterAction(
  formData: z.infer<typeof createChapterSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createChapterSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const chapter = await chapterService.createChapter(parsed.data);

    revalidatePath("/admin/chapters");
    revalidatePath(`/admin/subjects/${chapter.subjectId}`);
    revalidatePath("/admin/lectures");

    return {
      success: true,
      data: chapter,
      message: "Chapter created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Chapter
export async function updateChapterAction(
  id: string,
  formData: z.infer<typeof updateChapterSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Chapter ID is required." };
    }

    const parsed = updateChapterSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    // Capture old subject before updating.
    const existingChapter = await chapterService.getChapterById(id);

    const updatedChapter = await chapterService.updateChapter(id, parsed.data);

    revalidatePath("/admin/chapters");
    revalidatePath(`/admin/chapters/${id}`);
    revalidatePath(`/admin/subjects/${existingChapter.subjectId}`);
    revalidatePath(`/admin/subjects/${updatedChapter.subjectId}`);
    revalidatePath("/admin/lectures");

    return {
      success: true,
      data: updatedChapter,
      message: "Chapter updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get Chapters by Subject
export async function getChaptersBySubjectAction(
  subjectId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!subjectId?.trim()) {
      return { success: false, error: "Subject ID is required." };
    }

    const chapters = await chapterService.getChaptersBySubject(subjectId);

    return { success: true, data: chapters };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Chapter by ID
export async function getChapterByIdAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Chapter ID is required." };
    }

    const chapter = await chapterService.getChapterById(id);

    return { success: true, data: chapter };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Delete Chapter
export async function deleteChapterAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Chapter ID is required." };
    }

    // Fetch first to retain the subject ID for cache invalidation.
    const chapter = await chapterService.getChapterById(id);

    await chapterService.deleteChapter(id);

    revalidatePath("/admin/chapters");
    revalidatePath(`/admin/chapters/${id}`);
    revalidatePath(`/admin/subjects/${chapter.subjectId}`);
    revalidatePath("/admin/lectures");

    return {
      success: true,
      message: "Chapter deleted successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
