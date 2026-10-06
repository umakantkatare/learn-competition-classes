import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { exam } from "@/db/schema/exam-schema";

export async function getExams() {
  return db.select().from(exam).orderBy(desc(exam.year), desc(exam.createdAt));
}

export async function getExamById(id: string) {
  const [result] = await db.select().from(exam).where(eq(exam.id, id)).limit(1);

  return result ?? null;
}

export async function getActiveExams() {
  return db
    .select()
    .from(exam)
    .where(eq(exam.isActive, true))
    .orderBy(desc(exam.year), desc(exam.name));
}
