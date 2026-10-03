"use server";

import { getCourses } from "@/services/course.service";

import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function getCoursesAction() {
  await requireCourseManagementAccess();

  return getCourses();
}
