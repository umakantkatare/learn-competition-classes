"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Course } from "@/services/academic/course/types";

export const courseKeys = {
  all: ["academic", "courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
};

async function fetchCourses(): Promise<Course[]> {
  const response = await fetch("/api/academic/courses");

  if (!response.ok) {
    throw new Error("Unable to fetch courses.");
  }

  const result: {
    success: boolean;
    data?: Course[];
    error?: string;
  } = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Unable to fetch courses.");
  }

  return result.data;
}

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: fetchCourses,
  });
}

export function useInvalidateCourses() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: courseKeys.all,
    });
}
