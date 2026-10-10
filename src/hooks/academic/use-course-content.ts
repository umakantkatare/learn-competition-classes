"use client";

import { useQuery } from "@tanstack/react-query";

import { getCourseContent } from "@/services/academic/course-content/client";

export const courseContentKeys = {
  all: ["academic", "course-content"] as const,

  byCourse: (courseId: string) => [...courseContentKeys.all, courseId] as const,
};

export function useCourseContent(courseId: string) {
  return useQuery({
    queryKey: courseContentKeys.byCourse(courseId),
    queryFn: () => getCourseContent(courseId),
    enabled: Boolean(courseId),
  });
}
