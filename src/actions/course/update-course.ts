"use server";

import { courseUpdateSchema } from "@/validations/course/course";
import { updateCourse } from "@/services/course.service";
import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function updateCourseAction(courseId: string, input: unknown) {
  await requireCourseManagementAccess();

  const data = courseUpdateSchema.parse(input);

  return updateCourse(courseId, data);
}
