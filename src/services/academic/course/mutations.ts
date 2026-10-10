import { eq } from "drizzle-orm";

import { db } from "@/db";
import { course } from "@/db/schema/course-schema";

import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/validations/academic/course/course-validation";

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
      isActive: data.isActive,
    })
    .returning();

  return newCourse;
}

export async function updateCourse(id: string, input: UpdateCourseInput) {
  const data = updateCourseSchema.parse(input);

  const [updatedCourse] = await db
    .update(course)
    .set({
      name: data.name,
      slug: data.slug,
      description: data.description,
      thumbnail: data.thumbnail,
      features: data.features,
      price: data.price,
      salePrice: data.salePrice,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(course.id, id))
    .returning();

  return updatedCourse ?? null;
}

export async function setCourseStatus(id: string, isActive: boolean) {
  const [updatedCourse] = await db
    .update(course)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(course.id, id))
    .returning();

  return updatedCourse ?? null;
}
