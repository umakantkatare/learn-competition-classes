"use server";

import { getCourseById, getCourses } from "@/services/course.service";

import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function getCoursesAction() {
  await requireCourseManagementAccess();

  return getCourses();
}

export async function getCourseByIdAction(courseId: string) {
  await requireCourseManagementAccess();

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  return getCourseById(courseId);
}
