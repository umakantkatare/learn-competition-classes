import { eq } from "drizzle-orm";

import { db } from "@/db";
import { exam } from "@/db/schema/exam-schema";
import {
  createExamSchema,
  updateExamSchema,
} from "@/validations/academic/exam/exam-validation";

import type {
  CreateExamInput,
  UpdateExamInput,
} from "@/validations/academic/exam/exam-validation";

export async function createExam(input: CreateExamInput) {
  const data = createExamSchema.parse(input);

  const [newExam] = await db
    .insert(exam)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      year: data.year,
      isActive: data.isActive,
    })
    .returning();

  return newExam;
}

export async function updateExam(id: string, input: UpdateExamInput) {
  const data = updateExamSchema.parse(input);

  const [updatedExam] = await db
    .update(exam)
    .set({
      name: data.name,
      slug: data.slug,
      year: data.year,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(exam.id, id))
    .returning();

  return updatedExam ?? null;
}

export async function setExamStatus(id: string, isActive: boolean) {
  const [updatedExam] = await db
    .update(exam)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(exam.id, id))
    .returning();

  return updatedExam ?? null;
}
