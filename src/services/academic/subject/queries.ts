import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { subject } from "@/db/schema/subject-schema";

export async function getSubjects() {
  return db
    .select()
    .from(subject)
    .orderBy(desc(subject.createdAt), desc(subject.name));
}

export async function getSubjectById(id: string) {
  const [result] = await db
    .select()
    .from(subject)
    .where(eq(subject.id, id))
    .limit(1);

  return result ?? null;
}

export async function getActiveSubjects() {
  return db
    .select()
    .from(subject)
    .where(eq(subject.isActive, true))
    .orderBy(subject.name);
}
