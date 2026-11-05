"use client";

import type { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExaminationAction,
  updateExaminationAction,
  getExaminationsByCategoryAction,
  getExaminationBySlugAction,
  deactivateExaminationAction,
  getAllExaminationsAction,
} from "@/actions/academic/examination-actions";
import type { createExaminationSchema, updateExaminationSchema } from "@/validations/academic/examination-validations";


export interface ExaminationCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Examination {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isActive: boolean;
  createdAt?: string;
}

export type CreateExaminationInput = z.infer<typeof createExaminationSchema>;

export type UpdateExaminationInput = z.infer<typeof updateExaminationSchema>;

interface ActionResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

function unwrapActionResult<T>(result: ActionResult<unknown>): T {
  if (!result.success) {
    throw new Error(result.error || result.message || "Something went wrong.");
  }

  if (result.data === undefined) {
    throw new Error(result.message || "No data returned from server.");
  }

  return result.data as T;
}

// --------------------------------------------------
// Query Keys
// --------------------------------------------------

export const examinationKeys = {
  all: ["examinations"] as const,

  byCategory: (categoryId: string) =>
    [...examinationKeys.all, "category", categoryId] as const,

  bySlug: (slug: string) => [...examinationKeys.all, "slug", slug] as const,
};

// --------------------------------------------------
// 1. Get Examinations by Category
// --------------------------------------------------

export function useGetExaminationsByCategory(categoryId: string) {
  return useQuery({
    queryKey: examinationKeys.byCategory(categoryId),

    queryFn: async () => {
      const result = await getExaminationsByCategoryAction(categoryId);

      return unwrapActionResult<Examination[]>(result);
    },

    enabled: Boolean(categoryId),
  });
}

export function useGetAllExaminations() {
  return useQuery({
    queryKey: examinationKeys.all,

    queryFn: async () => {
      const result = await getAllExaminationsAction();

      return unwrapActionResult<Examination[]>(result);
    },
  });
}

// --------------------------------------------------
// 2. Get Examination by Slug
// --------------------------------------------------

export function useGetExaminationBySlug(slug: string) {
  return useQuery({
    queryKey: examinationKeys.bySlug(slug),

    queryFn: async () => {
      const result = await getExaminationBySlugAction(slug);

      return unwrapActionResult<Examination>(result);
    },

    enabled: Boolean(slug),
  });
}

// --------------------------------------------------
// 3. Create Examination
// --------------------------------------------------

export function useCreateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExaminationInput) => {
      const result = await createExaminationAction(payload);

      return unwrapActionResult<Examination>(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examinationKeys.all,
      });
    },
  });
}

// --------------------------------------------------
// 4. Update Examination
// --------------------------------------------------

export function useUpdateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExaminationInput;
    }) => {
      const result = await updateExaminationAction(id, payload);

      return unwrapActionResult<Examination>(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examinationKeys.all,
      });
    },
  });
}

// --------------------------------------------------
// 5. Deactivate Examination
// --------------------------------------------------

export function useDeactivateExamination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deactivateExaminationAction(id);

      return unwrapActionResult<Examination>(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: examinationKeys.all,
      });
    },
  });
}
