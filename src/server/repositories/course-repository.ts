import "server-only";

import { eq, desc } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@//db/schema/course-schema";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/validations/courses/course-validation";

export async function findCourses() {
  return db.select().from(course).orderBy(desc(course.createdAt));
}

export async function findActiveCourses() {
  return db
    .select()
    .from(course)
    .where(eq(course.isActive, true))
    .orderBy(desc(course.createdAt));
}

export async function findCourseById(id: string) {
  const [result] = await db
    .select()
    .from(course)
    .where(eq(course.id, id))
    .limit(1);

  return result ?? null;
}

export async function findCourseBySlug(slug: string) {
  const [result] = await db
    .select()
    .from(course)
    .where(eq(course.slug, slug))
    .limit(1);

  return result ?? null;
}

export async function createCourse(input: CreateCourseInput) {
  const data = createCourseSchema.parse(input);

  const [newCourse] = await db
    .insert(course)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      description: data.description,
      thumbnail: data.thumbnail,
      features: data.features,
      price: data.price,
      salePrice: data.salePrice,
      startDate: data.startDate === null ? null : new Date(data.startDate),
      endDate: data.endDate == null ? null : new Date(data.endDate),
      isActive: data.isActive,
    })
    .returning();

  return newCourse;
}

export async function updateCourseById(id: string, input: UpdateCourseInput) {
  const data = updateCourseSchema.parse(input);

  const { startDate, endDate, ...rest } = data;

  const [updatedCourse] = await db
    .update(course)
    .set({
      ...rest,

      ...(startDate !== undefined && {
        startDate: startDate === null ? null : new Date(startDate),
      }),

      ...(endDate !== undefined && {
        endDate: endDate === null ? null : new Date(endDate),
      }),

      updatedAt: new Date(),
    })
    .where(eq(course.id, id))
    .returning();

  return updatedCourse ?? null;
}

export async function deleteCourseById(id: string) {
  const [result] = await db
    .delete(course)
    .where(eq(course.id, id))
    .returning({ id: course.id });

  return result ?? null;
}
