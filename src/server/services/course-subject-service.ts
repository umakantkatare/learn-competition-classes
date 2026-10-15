import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";
import { user } from "@/db/schema/auth-schema";

import {
  deleteCourseSubjectById,
  findSubjectById,
  findSubjectByName,
  findSubjectsByCourseId,
  insertCourseSubject,
  updateCourseSubjectById,
} from "@/server/repositories/course-subject-repository";

import type {
  CreateCourseSubjectInput,
  UpdateCourseSubjectInput,
} from "@/validations/courses/course-subject-schema";

function assertValidSubjectName(name: string) {
  if (!name.trim()) {
    throw new Error("Subject name is required");
  }
}

async function assertCourseExists(courseId: string) {
  const [existingCourse] = await db
    .select({ id: course.id })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1);

  if (!existingCourse) {
    throw new Error("Course not found");
  }
}

async function assertTeacherExists(teacherId: string | null) {
  if (teacherId === null) return;

  const [existingTeacher] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, teacherId))
    .limit(1);

  if (!existingTeacher) {
    throw new Error("Teacher not found");
  }
}

async function assertUniqueSubjectName(
  courseId: string,
  name: string,
  excludeId?: string,
) {
  const existing = await findSubjectByName(courseId, name, excludeId);

  if (existing) {
    throw new Error("A subject with this name already exists in the course");
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export async function getCourseSubjects(courseId: string) {
  await assertCourseExists(courseId);
  return findSubjectsByCourseId(courseId);
}

export async function getCourseSubjectById(id: string) {
  const subject = await findSubjectById(id);

  if (!subject) {
    throw new Error("Subject not found");
  }

  return subject;
}

export async function createCourseSubject(data: CreateCourseSubjectInput) {
  assertValidSubjectName(data.name);

  await assertCourseExists(data.courseId);
  await assertTeacherExists(data.teacherId as string);

  await assertUniqueSubjectName(data.courseId, data.name);

  try {
    const normalizedData = {
      ...data,
      teacherId: data.teacherId?.trim() || null,
    };
    return await insertCourseSubject(normalizedData);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function updateCourseSubject(
  id: string,
  data: UpdateCourseSubjectInput,
) {
  const existing = await findSubjectById(id);

  if (!existing) {
    throw new Error("Subject not found");
  }

  const courseId = data.courseId ?? existing.courseId;
  const name = data.name ?? existing.name;
  const teacherId =
    data.teacherId === undefined ? existing.teacherId : data.teacherId;

  assertValidSubjectName(name);

  await assertCourseExists(courseId);
  await assertTeacherExists(teacherId);

  await assertUniqueSubjectName(courseId, name, id);

  try {
    return await updateCourseSubjectById(id, data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function deleteCourseSubject(id: string) {
  const existing = await findSubjectById(id);

  if (!existing) {
    throw new Error("Subject not found");
  }

  return deleteCourseSubjectById(id);
}
