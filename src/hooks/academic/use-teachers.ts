"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTeacherProfileAction,
  getAllTeachersAction,
  getTeacherProfileByIdAction,
  getTeacherProfileByUserIdAction,
  updateTeacherProfileAction,
  deleteTeacherProfileAction,
} from "@/actions/academic/teacher-actions";

import type {
  CreateTeacherInput,
  UpdateTeacherInput,
} from "@/validations/academic/teacher-validations";

// ============================================
// QUERY KEYS
// ============================================

export const teacherKeys = {
  all: ["teachers"] as const,

  lists: () => [...teacherKeys.all, "list"] as const,

  details: () => [...teacherKeys.all, "detail"] as const,

  detail: (id: string) => [...teacherKeys.details(), id] as const,

  byUserId: (userId: string) => [...teacherKeys.all, "user", userId] as const,
};

// ============================================
// 1. GET ALL TEACHERS
// ============================================

export function useGetAllTeachers() {
  return useQuery({
    queryKey: teacherKeys.lists(),

    queryFn: async () => {
      const response = await getAllTeachersAction();

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch teachers");
      }

      return response.data;
    },

    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// 2. GET TEACHER BY PROFILE ID
// ============================================

export function useGetTeacherById(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),

    queryFn: () => getTeacherProfileByIdAction(id),

    enabled: Boolean(id),

    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// 3. GET TEACHER BY USER ID
// ============================================

export function useGetTeacherByUserId(userId: string) {
  return useQuery({
    queryKey: teacherKeys.byUserId(userId),

    queryFn: () => getTeacherProfileByUserIdAction(userId),

    enabled: Boolean(userId),

    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// 4. CREATE TEACHER
// ============================================

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTeacherInput) =>
      createTeacherProfileAction(payload),

    onSuccess: async (result) => {
      if (!result.success) return;

      await queryClient.invalidateQueries({
        queryKey: teacherKeys.all,
      });
    },
  });
}

// ============================================
// 5. UPDATE TEACHER
// ============================================

interface UpdateTeacherVariables {
  id: string;
  payload: UpdateTeacherInput;
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTeacherVariables) =>
      updateTeacherProfileAction(id, payload),

    onSuccess: async (result, variables) => {
      if (!result.success) return;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: teacherKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

// ============================================
// 6. DELETE TEACHER
// ============================================

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeacherProfileAction(id),

    onSuccess: async (result, id) => {
      if (!result.success) return;

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teacherKeys.all,
        }),

        queryClient.removeQueries({
          queryKey: teacherKeys.detail(id),
        }),
      ]);
    },
  });
}
