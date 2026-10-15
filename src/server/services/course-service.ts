import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";

import {
  createCourseSchema,
  updateCourseSchema,
} from "@/validations/courses/course-validation";

import * as courseRepository from "@/server/repositories/course-repository";

export async function getCourses() {
  return courseRepository.findCourses();
}

export async function getActiveCourses() {
  return courseRepository.findActiveCourses();
}

export async function getCourseById(id: string) {
  return courseRepository.findCourseById(id);
}

export async function getCourseBySlug(slug: string) {
  return courseRepository.findCourseBySlug(slug);
}

export async function createCourse(input: unknown) {
  const data = createCourseSchema.parse(input);

  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.slug, data.slug))
    .limit(1);

  if (existingCourse) {
    throw new Error("A course with this slug already exists");
  }

  return courseRepository.createCourse(data);
}

export async function updateCourse(id: string, input: unknown) {
  const data = updateCourseSchema.parse(input);

  if (data.slug) {
    const [existingCourse] = await db
      .select({ id: course.id })
      .from(course)
      .where(eq(course.slug, data.slug))
      .limit(1);

    if (existingCourse && existingCourse.id !== id) {
      throw new Error("A course with this slug already exists");
    }
  }

  const existingCourse = await courseRepository.findCourseById(id);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  return courseRepository.updateCourseById(id, data);
}

export async function deleteCourse(id: string) {
  const existingCourse = await courseRepository.findCourseById(id);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  return courseRepository.deleteCourseById(id);
}
