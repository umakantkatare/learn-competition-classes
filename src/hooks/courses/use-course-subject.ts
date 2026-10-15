import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { courseSubjectApi } from "@/server/services/course-subject-api";

export const courseSubjectKeys = {
  all: ["course-subjects"] as const,

  publicLists: () => [...courseSubjectKeys.all, "public-list"] as const,
  publicList: (courseId: string) =>
    [...courseSubjectKeys.publicLists(), courseId] as const,

  adminLists: () => [...courseSubjectKeys.all, "admin-list"] as const,
  adminList: (courseId: string) =>
    [...courseSubjectKeys.adminLists(), courseId] as const,

  details: () => [...courseSubjectKeys.all, "detail"] as const,
  detail: (id: string) => [...courseSubjectKeys.details(), id] as const,
};

export function useCourseSubjects(courseId: string) {
  return useQuery({
    queryKey: courseSubjectKeys.adminList(courseId),
    queryFn: () => courseSubjectApi.getAllByCourseId(courseId),
    enabled: Boolean(courseId),
  });
}

export function usePublishedCourseSubjects(courseId: string) {
  return useQuery({
    queryKey: courseSubjectKeys.publicList(courseId),
    queryFn: () => courseSubjectApi.getPublishedByCourseId(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCourseSubject(id: string) {
  return useQuery({
    queryKey: courseSubjectKeys.detail(id),
    queryFn: () => courseSubjectApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateCourseSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: Parameters<typeof courseSubjectApi.create>[1];
    }) => courseSubjectApi.create(courseId, data),

    onSuccess: async (subject) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.adminList(subject.courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.publicList(subject.courseId),
        }),
      ]);
    },
  });
}

export function useUpdateCourseSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof courseSubjectApi.update>[1];
    }) => courseSubjectApi.update(id, data),

    onSuccess: async (subject) => {
      queryClient.setQueryData(courseSubjectKeys.detail(subject.id), subject);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.adminList(subject.courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.publicList(subject.courseId),
        }),
      ]);
    },
  });
}

export function useDeleteCourseSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseSubjectApi.delete(id),

    onSuccess: async (subject) => {
      queryClient.removeQueries({
        queryKey: courseSubjectKeys.detail(subject.id),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.adminList(subject.courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: courseSubjectKeys.publicList(subject.courseId),
        }),
      ]);
    },
  });
}
