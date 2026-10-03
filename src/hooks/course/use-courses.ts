"use client";

import { useQuery } from "@tanstack/react-query";
import { getCoursesAction } from "@/actions/course/get-courses";


export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCoursesAction,
  });
}