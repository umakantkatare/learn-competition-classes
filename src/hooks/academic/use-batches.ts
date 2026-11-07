"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createBatchAction,
  getAllBatchesAction,
  getAllPublishedBatchesAction,
  getBatchesByExaminationAction,
  getBatchBySlugAction,
  updateBatchAction,
  toggleBatchPublishStatusAction,
  deleteBatchAction,
} from "@/actions/academic/batch-actions";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BatchTeacher {
  batchId: string;
  teacherId: string;
  teacher: {
    id: string;
    userId: string;
    subject: string;
    experienceYears: number;
    qualification: string;
    bio: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export interface Batch {
  id: string;
  examinationId: string;
  createdBy: string;

  title: string;
  slug: string;
  description: string;
  features: string[];

  // ImageKit media
  thumbnail: string | null;
  thumbnailFileId: string | null;

  previewVideo: string | null;
  previewVideoFileId: string | null;

  originalPrice: string;
  discountPrice: string;
  isFree: boolean;

  startDate: string;
  expiryDate: string | null;
  validityMonths: number | null;

  medium: "ENGLISH" | "HINDI" | "HINGLISH";
  status: "UPCOMING" | "ONGOING" | "COMPLETED";

  isPublished: boolean;

  createdAt: string;
  updatedAt: string;

  teachers: BatchTeacher[];
}

// -----------------------------------------------------------------------------
// Query Keys
// -----------------------------------------------------------------------------

export const batchKeys = {
  all: ["batches"] as const,

  lists: () => [...batchKeys.all, "list"] as const,

  adminList: () => [...batchKeys.lists(), "admin"] as const,

  publishedList: () => [...batchKeys.lists(), "published"] as const,

  byExamination: (examinationId: string) =>
    [...batchKeys.lists(), "examination", examinationId] as const,

  details: () => [...batchKeys.all, "detail"] as const,

  detailBySlug: (slug: string) =>
    [...batchKeys.details(), "slug", slug] as const,
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

function getActionData<T>(
  response: ActionResponse,
  fallbackMessage: string,
): T {
  if (!response.success) {
    throw new Error(response.error || fallbackMessage);
  }

  if (response.data === undefined) {
    throw new Error("The server returned an empty response.");
  }

  return response.data as T;
}

function handleMutationResponse(
  response: ActionResponse,
  successMessage: string,
  errorMessage: string,
): boolean {
  if (!response.success) {
    toast.error(response.error || errorMessage);
    return false;
  }

  toast.success(response.message || successMessage);
  return true;
}

// -----------------------------------------------------------------------------
// Query Hooks
// -----------------------------------------------------------------------------

/**
 * Fetch all batches for admin/manager.
 */
export function useGetBatches() {
  return useQuery({
    queryKey: batchKeys.adminList(),

    queryFn: async () => {
      const response = await getAllBatchesAction();

      return getActionData<Batch[]>(response, "Failed to fetch batches.");
    },
  });
}

/**
 * Alias for fetching all admin batches.
 * Uses the same query key to avoid duplicate cache entries.
 */
export function useGetAllBatches() {
  return useGetBatches();
}

/**
 * Fetch all published batches.
 */
export function useGetPublishedBatches() {
  return useQuery({
    queryKey: batchKeys.publishedList(),

    queryFn: async () => {
      const response = await getAllPublishedBatchesAction();

      return getActionData<Batch[]>(
        response,
        "Failed to fetch published batches.",
      );
    },
  });
}

/**
 * Fetch batches belonging to a specific examination.
 */
export function useGetBatchesByExamination(examinationId?: string) {
  return useQuery({
    queryKey: batchKeys.byExamination(examinationId ?? ""),

    queryFn: async () => {
      if (!examinationId) {
        throw new Error("Examination ID is required.");
      }

      const response = await getBatchesByExaminationAction(examinationId);

      return getActionData<Batch[]>(
        response,
        "Failed to fetch examination batches.",
      );
    },

    enabled: Boolean(examinationId),
  });
}

/**
 * Fetch a published batch using its slug.
 */
export function useGetBatchBySlug(slug?: string) {
  return useQuery({
    queryKey: batchKeys.detailBySlug(slug ?? ""),

    queryFn: async () => {
      if (!slug) {
        throw new Error("Batch slug is required.");
      }

      const response = await getBatchBySlugAction(slug);

      return getActionData<Batch>(response, "Failed to fetch batch.");
    },

    enabled: Boolean(slug),
  });
}

// -----------------------------------------------------------------------------
// Mutation Hooks
// -----------------------------------------------------------------------------

/**
 * Create a new batch.
 */
export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBatchAction,

    onSuccess: (response) => {
      const success = handleMutationResponse(
        response,
        "Batch created successfully.",
        "Failed to create batch.",
      );

      if (!success) return;

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
}

/**
 * Update an existing batch.
 */
export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: string;
      formData: Parameters<typeof updateBatchAction>[1];
    }) => updateBatchAction(id, formData),

    onSuccess: (response) => {
      const success = handleMutationResponse(
        response,
        "Batch updated successfully.",
        "Failed to update batch.",
      );

      if (!success) return;

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
}

/**
 * Publish or unpublish a batch.
 */
export function useToggleBatchPublishStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      toggleBatchPublishStatusAction(id, isPublished),

    onSuccess: (response) => {
      const success = handleMutationResponse(
        response,
        "Batch status updated successfully.",
        "Failed to update batch status.",
      );

      if (!success) return;

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
}

/**
 * Delete (soft-unpublish) a batch.
 */
export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBatchAction,

    onSuccess: (response) => {
      const success = handleMutationResponse(
        response,
        "Batch unpublished successfully.",
        "Failed to unpublish batch.",
      );

      if (!success) return;

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
}
