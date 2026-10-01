"use server";

import { courseCreateSchema } from "@/validations/course/course";
import { createCourse, getCourseBySlug } from "@/services/course.service";
import { requireCourseManagementAccess } from "@/helper/auth/authorization";

export async function createCourseAction(input: unknown) {
  await requireCourseManagementAccess();

  const data = courseCreateSchema.parse(input);

  const existingCourse = await getCourseBySlug(data.slug);

  if (existingCourse) {
    throw new Error("Course slug already exists");
  }

  return createCourse(data);
}
