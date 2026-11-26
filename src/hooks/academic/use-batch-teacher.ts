"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  assignTeacherToBatchAction,
  assignMultipleTeachersAction,
  removeTeacherFromBatchAction,
  getTeachersForBatchAction,
  getBatchesForTeacherAction,
} from "@/actions/academic/batch-teacher-actions";

// ---------------------------------------------
// Types
// ---------------------------------------------

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

type BatchTeacherAssignment = {
  batchId: string;
  teacherId: string;
};

type TeacherBatch = {
  id: string;
  title: string;
};

type AssignTeacherInput = Parameters<typeof assignTeacherToBatchAction>[0];

type RemoveTeacherInput = Parameters<typeof removeTeacherFromBatchAction>[0];

// ---------------------------------------------
// Response Handler
// ---------------------------------------------

export const batchTeacherKeys = {
  all: ["batch-teachers"] as const,

  byBatch: (batchId: string) =>
    [...batchTeacherKeys.all, "batch", batchId] as const,

  myBatches: () => [...batchTeacherKeys.all, "my-batches"] as const,
};

function unwrapActionResult<T>(result: ActionResult<unknown>): T {
  if (!result.success) {
    throw new Error(result.error ?? "Something went wrong.");
  }

  if (result.data === undefined) {
    throw new Error("No data returned from server.");
  }

  return result.data as T;
}

// ---------------------------------------------
// 1. Get Teachers Assigned To Batch
// ---------------------------------------------

export function useTeachersForBatch(batchId: string) {
  return useQuery({
    queryKey: batchTeacherKeys.byBatch(batchId),

    queryFn: async (): Promise<BatchTeacherAssignment[]> => {
      const result = await getTeachersForBatchAction(batchId);

      return unwrapActionResult<BatchTeacherAssignment[]>(result);
    },

    enabled: Boolean(batchId),

    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------
// 2. Get Batches For Authenticated Teacher
// ---------------------------------------------

export function useMyBatches() {
  return useQuery({
    queryKey: batchTeacherKeys.myBatches(),

    queryFn: async (): Promise<TeacherBatch[]> => {
      const result = await getBatchesForTeacherAction();

      return unwrapActionResult<TeacherBatch[]>(result);
    },

    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------
// Cache Invalidation
// ---------------------------------------------

function invalidateBatchTeacherQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  return queryClient.invalidateQueries({
    queryKey: batchTeacherKeys.all,
  });
}

// ---------------------------------------------
// 3. Assign One Teacher To Batch
// ---------------------------------------------

export function useAssignTeacherToBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AssignTeacherInput) => {
      const result = await assignTeacherToBatchAction(input);

      return unwrapActionResult<BatchTeacherAssignment>(result);
    },

    onSuccess: async () => {
      await invalidateBatchTeacherQueries(queryClient);
    },
  });
}

// ---------------------------------------------
// 4. Assign Multiple Teachers To Batch
// ---------------------------------------------

export function useAssignMultipleTeachers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      batchId,
      teacherIds,
    }: {
      batchId: string;
      teacherIds: string[];
    }) => {
      const result = await assignMultipleTeachersAction(batchId, teacherIds);

      return unwrapActionResult<BatchTeacherAssignment[]>(result);
    },

    onSuccess: async () => {
      await invalidateBatchTeacherQueries(queryClient);
    },
  });
}

// ---------------------------------------------
// 5. Remove Teacher From Batch
// ---------------------------------------------

export function useRemoveTeacherFromBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RemoveTeacherInput) => {
      const result = await removeTeacherFromBatchAction(input);

      return unwrapActionResult<BatchTeacherAssignment>(result);
    },

    onSuccess: async () => {
      await invalidateBatchTeacherQueries(queryClient);
    },
  });
}
