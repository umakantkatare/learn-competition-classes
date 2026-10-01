"use server";

import { requireCourseManagementAccess } from "@/helper/auth/authorization";
import { toggleCourseStatus } from "@/services/course.service";

export async function toggleCourseStatusAction(courseId: string) {
  await requireCourseManagementAccess();

  return toggleCourseStatus(courseId);
}
