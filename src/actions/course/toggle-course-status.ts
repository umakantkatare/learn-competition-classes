"use server";

import { toggleCourseStatus } from "@/services/course.service";
import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function toggleCourseStatusAction(courseId: string) {
  await requireCourseManagementAccess();

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  return toggleCourseStatus(courseId);
}