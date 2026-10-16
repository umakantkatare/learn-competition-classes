import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teacherProfileApi } from "@/app/features/services/teacher-profile-api";
import type {
  CreateTeacherProfileInput,
  UpdateTeacherProfileInput,
} from "@/validations/teacher-profile-validation";

export const teacherProfileKeys = {
  all: ["teacher-profiles"] as const,

  lists: () => [...teacherProfileKeys.all, "list"] as const,

  list: () => [...teacherProfileKeys.lists()] as const,

  details: () => [...teacherProfileKeys.all, "detail"] as const,

  detail: (userId: string) =>
    [...teacherProfileKeys.details(), userId] as const,
};

export function useTeacherProfiles() {
  return useQuery({
    queryKey: teacherProfileKeys.list(),
    queryFn: () => teacherProfileApi.getAll(),
    retry: false,
  });
}

export function useCreateTeacherProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeacherProfileInput) =>
      teacherProfileApi.create(data),

    onSuccess: (profile) => {
      queryClient.setQueryData(teacherProfileKeys.detail("me"), profile);

      queryClient.setQueryData(
        teacherProfileKeys.detail(profile.userId),
        profile,
      );

      queryClient.invalidateQueries({
        queryKey: teacherProfileKeys.lists(),
      });
    },
  });
}

export function useUpdateTeacherProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateTeacherProfileInput;
    }) => teacherProfileApi.update(userId, data),

    onSuccess: (profile) => {
      queryClient.setQueryData(
        teacherProfileKeys.detail(profile.userId),
        profile,
      );

      queryClient.invalidateQueries({
        queryKey: teacherProfileKeys.detail("me"),
      });

      queryClient.invalidateQueries({
        queryKey: teacherProfileKeys.lists(),
      });
    },
  });
}

export function useDeleteTeacherProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => teacherProfileApi.delete(userId),

    onSuccess: (profile) => {
      queryClient.removeQueries({
        queryKey: teacherProfileKeys.detail(profile.userId),
        exact: true,
      });

      queryClient.invalidateQueries({
        queryKey: teacherProfileKeys.detail("me"),
      });

      queryClient.invalidateQueries({
        queryKey: teacherProfileKeys.lists(),
      });
    },
  });
}
