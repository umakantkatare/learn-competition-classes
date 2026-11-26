"use server";

import { requireAdminOrManager } from "@/lib/authorize";
import { studentService } from "@/server/services/academic/student-service";

export async function getTotalStudentsAction() {
  try {
    const authResult = await requireAdminOrManager();

    if (!authResult.authorized) {
      return {
        success: false as const,
        status: authResult.status,
        error: authResult.message,
      };
    }

    const totalStudents = await studentService.getTotalStudents();

    return {
      success: true as const,
      data: totalStudents,
    };
  } catch (error) {
    console.error("Get total students error:", error);

    return {
      success: false as const,
      status: 500,
      error: "Failed to fetch total students",
    };
  }
}

export async function getStudentsPerBatchAction() {
  try {
    const authResult = await requireAdminOrManager();

    if (!authResult.authorized) {
      return {
        success: false as const,
        status: authResult.status,
        error: authResult.message,
      };
    }

    const students = await studentService.getStudentsPerBatch();

    return {
      success: true as const,
      data: students,
    };
  } catch (error) {
    console.error("Get students per batch error:", error);

    return {
      success: false as const,
      status: 500,
      error: "Failed to fetch students per batch",
    };
  }
}

export async function getStudentsByBatchIdAction(batchId: string) {
  try {
    const authResult = await requireAdminOrManager();

    if (!authResult.authorized) {
      return {
        success: false as const,
        status: authResult.status,
        error: authResult.message,
      };
    }

    if (!batchId?.trim()) {
      return {
        success: false as const,
        status: 400,
        error: "Batch ID is required",
      };
    }

    const totalStudents = await studentService.getStudentsByBatchId(batchId);

    return {
      success: true as const,
      data: totalStudents,
    };
  } catch (error) {
    console.error("Get students by batch error:", error);

    return {
      success: false as const,
      status: 500,
      error: "Failed to fetch batch students",
    };
  }
}
