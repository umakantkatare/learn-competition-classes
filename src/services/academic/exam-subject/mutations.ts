import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { examSubject } from "@/db/schema/exam-subject-schema";

interface AssignSubjectToExamInput {
  examId: string;
  subjectId: string;
}

export async function assignSubjectToExam(
  input: AssignSubjectToExamInput,
) {
  const [assignment] = await db
    .insert(examSubject)
    .values({
      id: crypto.randomUUID(),
      examId: input.examId,
      subjectId: input.subjectId,
    })
    .onConflictDoNothing({
      target: [
        examSubject.examId,
        examSubject.subjectId,
      ],
    })
    .returning();

  return assignment ?? null;
}

export async function removeSubjectFromExam(
  examId: string,
  subjectId: string,
) {
  const [removedAssignment] = await db
    .delete(examSubject)
    .where(
      and(
        eq(examSubject.examId, examId),
        eq(examSubject.subjectId, subjectId),
      ),
    )
    .returning();

  return removedAssignment ?? null;
}