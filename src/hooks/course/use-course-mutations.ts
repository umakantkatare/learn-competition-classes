"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toggleCourseStatusAction } from "@/actions/course/toggle-course-status";

export function useToggleCourseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCourseStatusAction,

    onSuccess: async (course) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["course", course.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        }),
      ]);
    },
  });
}
