"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { LectureService } from "@/server/services/academic/lecture-service";
import {
  createLectureSchema,
  updateLectureSchema,
} from "@/validations/academic/academic-validations";

const lectureService = new LectureService();

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

// 1. Create Lecture
export async function createLectureAction(
  formData: z.infer<typeof createLectureSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createLectureSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const lecture = await lectureService.createLecture(parsed.data);

    revalidatePath("/admin/lectures");
    revalidatePath(`/admin/chapters/${lecture.chapterId}`);
    revalidatePath(`/admin/subjects/${lecture.subjectId}`);

    return {
      success: true,
      data: lecture,
      message: "Lecture created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Lecture
export async function updateLectureAction(
  id: string,
  formData: z.infer<typeof updateLectureSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Lecture ID is required." };
    }

    const parsed = updateLectureSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    // Preserve old relationships for cache invalidation.
    const existingLecture = await lectureService.getLectureById(id);

    const updatedLecture = await lectureService.updateLecture(id, parsed.data);

    revalidatePath("/admin/lectures");
    revalidatePath(`/admin/lectures/${id}`);

    revalidatePath(`/admin/chapters/${existingLecture.chapterId}`);
    revalidatePath(`/admin/subjects/${existingLecture.subjectId}`);

    revalidatePath(`/admin/chapters/${updatedLecture.chapterId}`);
    revalidatePath(`/admin/subjects/${updatedLecture.subjectId}`);

    return {
      success: true,
      data: updatedLecture,
      message: "Lecture updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get Lectures by Chapter
export async function getLecturesByChapterAction(
  chapterId: string,
): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!chapterId?.trim()) {
      return { success: false, error: "Chapter ID is required." };
    }

    const lectures = await lectureService.getLecturesByChapter(chapterId);

    return { success: true, data: lectures };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Lecture by ID
export async function getLectureByIdAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Lecture ID is required." };
    }

    const lecture = await lectureService.getLectureById(id);

    return { success: true, data: lecture };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 5. Delete Lecture
export async function deleteLectureAction(id: string): Promise<ActionResult> {
  try {
    if (!(await requireAdminOrManager())) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return { success: false, error: "Lecture ID is required." };
    }

    const lecture = await lectureService.getLectureById(id);

    await lectureService.deleteLecture(id);

    revalidatePath("/admin/lectures");
    revalidatePath(`/admin/chapters/${lecture.chapterId}`);
    revalidatePath(`/admin/subjects/${lecture.subjectId}`);

    return {
      success: true,
      message: "Lecture deleted successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
