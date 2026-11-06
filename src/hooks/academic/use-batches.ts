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
  thumbnail: string | null;
  previewVideo: string | null;
  originalPrice: string;
  discountPrice: string;
  isFree: boolean;
  startDate: string;
  expiryDate: string;
  validityMonths: number;
  medium: "ENGLISH" | "HINDI" | "HINGLISH";
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "EXPIRED";
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

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch batches.");
      }

      return response.data as Batch[];
    },
  });
}

export function useGetAllBatches() {
  return useQuery({
    queryKey: [...batchKeys.adminList(), "all"],
    queryFn: async () => {
      const response = await getAllBatchesAction();

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch all batches.");
      }

      return response.data as Batch[];
    },
  });
}

/**
 * Fetch all published batches.
 */
export function useGetPublishedBatches() {
  return useQuery({
    queryKey: batchKeys.publishedList(),
    queryFn: async () => {
      const response = await getAllPublishedBatchesAction();

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch published batches.");
      }

      return response.data as Batch[];
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

      if (!response.success) {
        throw new Error(
          response.error || "Failed to fetch examination batches.",
        );
      }

      return response.data as Batch[];
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

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch batch.");
      }

      return response.data as Batch;
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
      if (!response.success) {
        toast.error(response.error || "Failed to create batch.");
        return;
      }

      toast.success("Batch created successfully.");

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
      if (!response.success) {
        toast.error(response.error || "Failed to update batch.");
        return;
      }

      toast.success("Batch updated successfully.");

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
      if (!response.success) {
        toast.error(response.error || "Failed to update batch status.");
        return;
      }

      toast.success("Batch status updated successfully.");

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
      if (!response.success) {
        toast.error(response.error || "Failed to delete batch.");
        return;
      }

      toast.success("Batch deleted successfully.");

      queryClient.invalidateQueries({
        queryKey: batchKeys.all,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });
}
