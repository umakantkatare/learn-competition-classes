"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createManagerAction,
  updateManagerProfileAction,
  updateOwnManagerProfileAction,
  getManagerProfileByUserIdAction,
  getManagerProfileByIdAction,
  getAllManagerProfilesAction,
  deleteManagerProfileAction,
} from "@/actions/academic/manager-actions";

import type { CreateManagerInput } from "@/validations/academic/manager-validations";

// ==================================================
// QUERY KEYS
// ==================================================

export const managerKeys = {
  all: ["managers"] as const,

  lists: () => [...managerKeys.all, "list"] as const,

  details: () => [...managerKeys.all, "detail"] as const,

  detail: (id: string) => [...managerKeys.details(), id] as const,

  byUserId: (userId: string) => [...managerKeys.all, "user", userId] as const,
};

// Update this key to match your actual own-profile query.
export const MY_MANAGER_PROFILE_KEY = ["myManagerProfile"] as const;

// ==================================================
// SHARED ERROR HANDLING
// ==================================================

function unwrapActionResult<T>(
  result: { success: true; data: T } | { success: false; error: string },
): T {
  if (!result.success) {
    throw new Error(result.error);
  }

  return result.data;
}

// ==================================================
// QUERIES
// ==================================================

/**
 * Fetch all manager profiles.
 */
export function useGetAllManagers() {
  return useQuery({
    queryKey: managerKeys.lists(),

    queryFn: async () => {
      const result = await getAllManagerProfilesAction();

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },
  });
}

/**
 * Fetch a manager profile by profile ID.
 */
export function useGetManagerById(id: string) {
  return useQuery({
    queryKey: managerKeys.detail(id),

    queryFn: async () => {
      const result = await getManagerProfileByIdAction(id);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    enabled: Boolean(id),
  });
}

/**
 * Fetch a manager profile by associated user ID.
 */
export function useGetManagerByUserId(userId: string) {
  return useQuery({
    queryKey: managerKeys.byUserId(userId),

    queryFn: async () => {
      const result = await getManagerProfileByUserIdAction(userId);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    enabled: Boolean(userId),
  });
}

// ==================================================
// MUTATIONS
// ==================================================

/**
 * Create a manager profile.
 *
 * Dependencies and business logic must be handled
 * inside the server-side implementation.
 */
export function useCreateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateManagerInput) => {
      const result = await createManagerAction(formData);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: managerKeys.all,
      });
    },
  });
}

/**
 * Update a manager profile by profile ID.
 */
export function useUpdateManagerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: CreateManagerInput;
    }) => {
      const result = await updateManagerProfileAction(id, formData);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: managerKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: managerKeys.detail(variables.id),
        }),

        queryClient.invalidateQueries({
          queryKey: managerKeys.all,
          predicate: (query) => query.queryKey[1] === "user",
        }),
      ]);
    },
  });
}

/**
 * Update the authenticated manager's own profile.
 */
export function useUpdateOwnManagerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CreateManagerInput) => {
      const result = await updateOwnManagerProfileAction(formData);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: MY_MANAGER_PROFILE_KEY,
        }),

        queryClient.invalidateQueries({
          queryKey: managerKeys.all,
        }),
      ]);
    },
  });
}

/**
 * Delete a manager profile.
 */
export function useDeleteManagerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteManagerProfileAction(id);

      return unwrapActionResult(
        result as
          { success: true; data: unknown } | { success: false; error: string },
      );
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: managerKeys.all,
      });
    },
  });
}
