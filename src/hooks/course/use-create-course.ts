"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createCourseAction } from "@/actions/course/create-course";

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourseAction,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["courses"],
      });
    },
  });
}