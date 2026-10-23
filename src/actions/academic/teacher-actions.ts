"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { TeacherService } from "@/server/services/academic/teacher-service";
import {
  createTeacherProfileSchema,
  updateTeacherProfileSchema,
} from "@/validations/academic/academic-validations";

const teacherService = new TeacherService();

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

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function requireAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return ["ADMIN", "MANAGER"].includes(session?.user?.role ?? "");
}

// 1. Create Teacher Profile — Admin only
export async function createTeacherProfileAction(
  formData: z.infer<typeof createTeacherProfileSchema>,
): Promise<ActionResult> {
  try {
    if (!(await requireAdmin())) {
      return { success: false, error: "Unauthorized." };
    }

    const parsed = createTeacherProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const profile = await teacherService.createProfile(parsed.data);

    revalidatePath("/admin/teachers");

    return {
      success: true,
      data: profile,
      message: "Teacher profile created successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 2. Update Teacher Profile — Admin or profile owner
export async function updateTeacherProfileAction(
  id: string,
  formData: z.infer<typeof updateTeacherProfileSchema>,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    if (!id?.trim()) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const parsed = updateTeacherProfileSchema.safeParse(formData);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const existingProfile = await teacherService.getProfileById(id);

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existingProfile.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: "Unauthorized." };
    }

    const updatedProfile = await teacherService.updateProfile(id, parsed.data);

    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${id}`);

    return {
      success: true,
      data: updatedProfile,
      message: "Teacher profile updated successfully.",
    };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 3. Get Teacher Profile by User ID — Admin or same user
export async function getTeacherProfileByUserIdAction(
  userId: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, error: "Unauthorized." };
    }

    if (!userId?.trim()) {
      return { success: false, error: "User ID is required." };
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner = session.user.id === userId;

    if (!isAdmin && !isOwner) {
      return { success: false, error: "Unauthorized." };
    }

    const profile = await teacherService.getProfileByUserId(userId);

    return { success: true, data: profile };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}

// 4. Get Teacher Profile by Profile ID
// Public endpoint: return only public-safe profile fields.
export async function getTeacherProfileByIdAction(
  id: string,
): Promise<ActionResult> {
  try {
    if (!id?.trim()) {
      return {
        success: false,
        error: "Teacher profile ID is required.",
      };
    }

    const profile = await teacherService.getProfileById(id);

    // TODO: Return a public DTO containing only fields intended
    // for the public teacher page. Do not expose private user data.
    return { success: true, data: profile };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
