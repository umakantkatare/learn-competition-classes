import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subject } from "@/db/schema/subject-schema";
import {
  createSubjectSchema,
  updateSubjectSchema,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from "@/validations/academic/subject/subject-validation";

export async function createSubject(input: CreateSubjectInput) {
  const data = createSubjectSchema.parse(input);

  const [newSubject] = await db
    .insert(subject)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
    })
    .returning();

  return newSubject;
}

export async function updateSubject(id: string, input: UpdateSubjectInput) {
  const data = updateSubjectSchema.parse(input);

  const [updatedSubject] = await db
    .update(subject)
    .set({
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(subject.id, id))
    .returning();

  return updatedSubject ?? null;
}

export async function setSubjectStatus(id: string, isActive: boolean) {
  const [updatedSubject] = await db
    .update(subject)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(subject.id, id))
    .returning();

  return updatedSubject ?? null;
}
