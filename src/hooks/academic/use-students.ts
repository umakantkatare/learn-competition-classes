"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getTotalStudentsAction,
  getStudentsPerBatchAction,
  getStudentsByBatchIdAction,
} from "@/actions/academic/student-actions";

// Query Keys
export const studentKeys = {
  all: ["students"] as const,

  total: () => [...studentKeys.all, "total"] as const,

  perBatch: () => [...studentKeys.all, "per-batch"] as const,

  byBatchId: (batchId: string) =>
    [...studentKeys.all, "batch", batchId] as const,
};

// Handle Server Action responses
function handleActionResponse<T>(
  result:
    | { success: true; data: T }
    | { success: false; error: string; status?: number },
): T {
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

// Get total unique students
export function useTotalStudents() {
  return useQuery({
    queryKey: studentKeys.total(),

    queryFn: async () => {
      const result = await getTotalStudentsAction();

      return handleActionResponse(result);
    },

    staleTime: 5 * 60 * 1000,
  });
}

// Get students count per batch
export function useStudentsPerBatch() {
  return useQuery({
    queryKey: studentKeys.perBatch(),

    queryFn: async () => {
      const result = await getStudentsPerBatchAction();

      return handleActionResponse(result);
    },

    staleTime: 5 * 60 * 1000,
  });
}

// Get students count for a specific batch
export function useStudentsByBatchId(batchId: string) {
  return useQuery({
    queryKey: studentKeys.byBatchId(batchId),

    queryFn: async () => {
      const result = await getStudentsByBatchIdAction(batchId);

      return handleActionResponse(result);
    },

    enabled: Boolean(batchId?.trim()),

    staleTime: 5 * 60 * 1000,
  });
}
