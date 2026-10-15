import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseApi } from "@/server/services/course-api";

export const courseKeys = {
  all: ["courses"] as const,

  lists: () => [...courseKeys.all, "list"] as const,

  list: (filters?: Record<string, unknown>) =>
    [...courseKeys.lists(), filters] as const,

  details: () => [...courseKeys.all, "detail"] as const,

  detail: (id: string) => [...courseKeys.details(), id] as const,
};

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: courseApi.getAll,
  });
}

export function useCourse(id: string) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.create,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof courseApi.update>[1];
    }) => courseApi.update(id, data),

    onSuccess: async (updatedCourse) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseKeys.all,
        }),
        queryClient.setQueryData(
          courseKeys.detail(updatedCourse.id),
          updatedCourse,
        ),
      ]);
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.delete,

    onSuccess: async (_, id) => {
      queryClient.removeQueries({
        queryKey: courseKeys.detail(id),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });
    },
  });
}
