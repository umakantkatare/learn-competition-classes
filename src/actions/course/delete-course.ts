"use server";

import { requireCourseManagementAccess } from "@/helper/auth/authorization";
import { deleteCourse } from "@/services/course.service";

export async function deleteCourseAction(courseId: string) {
  await requireCourseManagementAccess();

  return deleteCourse(courseId);
}
