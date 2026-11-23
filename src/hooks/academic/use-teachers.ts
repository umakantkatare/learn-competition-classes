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

export const teacherKeys = {
  all: ["teachers"] as const,

  lists: () => [...teacherKeys.all, "list"] as const,

  details: () => [...teacherKeys.all, "detail"] as const,

  detail: (id: string) => [...teacherKeys.details(), id] as const,

  byUserId: (userId: string) => [...teacherKeys.all, "user", userId] as const,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

// 1. GET ALL TEACHERS

export function useGetAllTeachers() {
  return useQuery({
    queryKey: teacherKeys.lists(),

    queryFn: async () => {
      try {
        const response = await getAllTeachersAction();

        if (!response.success) {
          throw new Error(
            response.error || response.message || "Failed to fetch teachers.",
          );
        }

        return response.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    staleTime: 5 * 60 * 1000,
  });
}

// 2. GET TEACHER BY PROFILE ID

export function useGetTeacherById(id: string) {
  return useQuery({
    queryKey: teacherKeys.detail(id),

    queryFn: async () => {
      try {
        const response = await getTeacherProfileByIdAction(id);

        if (!response.success) {
          throw new Error(
            response.error || response.message || "Failed to fetch teacher.",
          );
        }

        return response.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    enabled: Boolean(id?.trim()),

    staleTime: 5 * 60 * 1000,
  });
}

// 3. GET TEACHER BY USER ID

export function useGetTeacherByUserId(userId: string) {
  return useQuery({
    queryKey: teacherKeys.byUserId(userId),

    queryFn: async () => {
      try {
        const response = await getTeacherProfileByUserIdAction(userId);

        if (!response.success) {
          throw new Error(
            response.error ||
              response.message ||
              "Failed to fetch teacher profile.",
          );
        }

        return response.data;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    enabled: Boolean(userId?.trim()),

    staleTime: 5 * 60 * 1000,
  });
}

// 4. CREATE TEACHER

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTeacherInput) => {
      try {
        const response = await createTeacherProfileAction(payload);

        if (!response.success) {
          throw new Error(
            response.error || response.message || "Failed to create teacher.",
          );
        }

        return response;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teacherKeys.all,
      });
    },
  });
}

// 5. UPDATE TEACHER

interface UpdateTeacherVariables {
  id: string;
  payload: UpdateTeacherInput;
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateTeacherVariables) => {
      try {
        const response = await updateTeacherProfileAction(id, payload);

        if (!response.success) {
          throw new Error(
            response.error || response.message || "Failed to update teacher.",
          );
        }

        return response;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    onSuccess: async (_result, variables) => {
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

// 6. DELETE TEACHER

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await deleteTeacherProfileAction(id);

        if (!response.success) {
          throw new Error(
            response.error || response.message || "Failed to delete teacher.",
          );
        }

        return response;
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },

    onSuccess: async (_result, id) => {
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
