"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getExamCategoriesAction,
  createExamCategoryAction,
  updateExamCategoryAction,
  deactivateExamCategoryAction,
} from "@/actions/academic/exam-category-actions";
import { ExamCategory } from "@/types/exam-category";

// ─── Query Keys ─────────────────────────────────────────────────

export const examCategoryKeys = {
  all: ["examCategories"] as const,

  lists: () => [...examCategoryKeys.all, "list"] as const,

  list: (onlyActive: boolean) =>
    [...examCategoryKeys.lists(), { onlyActive }] as const,
};

// ─── GET: Exam Categories ───────────────────────────────────────

export function useGetExamCategories(onlyActive = false) {
  return useQuery<ExamCategory[]>({
    queryKey: examCategoryKeys.list(onlyActive),

    queryFn: async (): Promise<ExamCategory[]> => {
      const result = await getExamCategoriesAction(onlyActive);

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch exam categories.");
      }

      return result.data as ExamCategory[];
    },

    staleTime: 60_000,
  });
}

// ─── CREATE: Exam Category ──────────────────────────────────────

export function useCreateExamCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createExamCategoryAction(formData);
      console.log("create-exam", result);
      if (!result.success) {
        throw new Error(result.error || "Failed to create exam category.");
      }

      return result.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examCategoryKeys.all,
      });
    },
  });
}

// ─── UPDATE: Exam Category ──────────────────────────────────────

export function useUpdateExamCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }) => {
      const result = await updateExamCategoryAction(id, formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to update exam category.");
      }

      return result.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examCategoryKeys.all,
      });
    },
  });
}

// ─── DEACTIVATE: Exam Category ──────────────────────────────────

export function useDeactivateExamCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deactivateExamCategoryAction(id);

      if (!result.success) {
        throw new Error(result.error || "Failed to deactivate exam category.");
      }

      return result.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examCategoryKeys.all,
      });
    },
  });
}
