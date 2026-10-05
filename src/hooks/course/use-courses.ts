"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getCourseByIdAction,
  getCoursesAction,
} from "@/actions/course/get-courses";

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCoursesAction,
  });
}

export function useCourse(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseByIdAction(courseId),
    enabled: Boolean(courseId),
  });
}