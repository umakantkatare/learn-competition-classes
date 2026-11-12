"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  checkValidAccessAction,
  getUserEnrollmentsAction,
  createEnrollmentAction,
  updateEnrollmentAction,
  revokeEnrollmentAction,
  extendValidityAction,
} from "@/actions/academic/enrollment-actions";

// ---------------------------------------------
// Types
// ---------------------------------------------

type CreateEnrollmentInput = Parameters<typeof createEnrollmentAction>[0];

type UpdateEnrollmentInput = Parameters<typeof updateEnrollmentAction>[1];

type EnrollmentActionResult = {
  success: boolean;
  data?: unknown;
  hasAccess?: boolean;
  message?: string;
  error?: string;
};

// ---------------------------------------------
// Query Keys
// ---------------------------------------------

export const enrollmentKeys = {
  all: ["enrollments"] as const,

  lists: () => [...enrollmentKeys.all, "list"] as const,

  userEnrollments: () => [...enrollmentKeys.lists(), "me"] as const,

  details: () => [...enrollmentKeys.all, "detail"] as const,

  access: (batchId: string) =>
    [...enrollmentKeys.details(), "access", batchId] as const,
};

// ---------------------------------------------
// Helper
// ---------------------------------------------

function ensureSuccess<T extends EnrollmentActionResult>(result: T): T {
  if (!result.success) {
    throw new Error(result.error || "Something went wrong.");
  }

  return result;
}

// ---------------------------------------------
// 1. Check Current User Batch Access
// ---------------------------------------------

export function useCheckValidAccess(batchId: string) {
  return useQuery({
    queryKey: enrollmentKeys.access(batchId),

    queryFn: async () => {
      const result = await checkValidAccessAction(batchId);
      return ensureSuccess(result);
    },

    enabled: Boolean(batchId),

    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,

    select: (result) => result.hasAccess ?? false,
  });
}

// ---------------------------------------------
// 2. Get Current User Enrollments
// ---------------------------------------------

export function useGetUserEnrollments() {
  return useQuery({
    queryKey: enrollmentKeys.userEnrollments(),

    queryFn: async () => {
      const result = await getUserEnrollmentsAction();
      return ensureSuccess(result);
    },

    staleTime: 1000 * 60 * 2,

    select: (result) => result.data ?? [],
  });
}

// ---------------------------------------------
// 3. Admin: Create Enrollment
// ---------------------------------------------

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEnrollmentInput) => {
      const result = await createEnrollmentAction(input);
      return ensureSuccess(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: enrollmentKeys.all,
      });
    },
  });
}

// ---------------------------------------------
// 4. Admin: Update Enrollment
// ---------------------------------------------

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEnrollmentInput;
    }) => {
      const result = await updateEnrollmentAction(id, data);
      return ensureSuccess(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: enrollmentKeys.all,
      });
    },
  });
}

// ---------------------------------------------
// 5. Admin: Revoke Enrollment
// ---------------------------------------------

export function useRevokeEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const result = await revokeEnrollmentAction(enrollmentId);
      return ensureSuccess(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: enrollmentKeys.all,
      });
    },
  });
}

// ---------------------------------------------
// 6. Admin: Extend Enrollment Validity
// ---------------------------------------------

export function useExtendEnrollmentValidity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enrollmentId,
      extraMonths,
    }: {
      enrollmentId: string;
      extraMonths: number;
    }) => {
      const result = await extendValidityAction(enrollmentId, extraMonths);

      return ensureSuccess(result);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: enrollmentKeys.all,
      });
    },
  });
}
