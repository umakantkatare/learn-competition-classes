import { and, asc, eq, notExists } from "drizzle-orm";

import { db } from "@/db";
import { exam } from "@/db/schema/exam-schema";
import { examSubject } from "@/db/schema/exam-subject-schema";
import { subject } from "@/db/schema/subject-schema";

export async function getSubjectsByExamId(
  examId: string,
) {
  return db
    .select({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      isActive: subject.isActive,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    })
    .from(examSubject)
    .innerJoin(
      subject,
      eq(examSubject.subjectId, subject.id),
    )
    .where(eq(examSubject.examId, examId))
    .orderBy(asc(subject.name));
}

export async function getAvailableSubjectsForExam(
  examId: string,
) {
  return db
    .select({
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      isActive: subject.isActive,
    })
    .from(subject)
    .where(
      and(
        eq(subject.isActive, true),
        notExists(
          db
            .select({ id: examSubject.id })
            .from(examSubject)
            .where(
              and(
                eq(
                  examSubject.examId,
                  examId,
                ),
                eq(
                  examSubject.subjectId,
                  subject.id,
                ),
              ),
            ),
        ),
      ),
    )
    .orderBy(asc(subject.name));
}

export async function getExamsBySubjectId(
  subjectId: string,
) {
  return db
    .select({
      id: exam.id,
      name: exam.name,
      slug: exam.slug,
      year: exam.year,
      isActive: exam.isActive,
    })
    .from(examSubject)
    .innerJoin(
      exam,
      eq(examSubject.examId, exam.id),
    )
    .where(eq(examSubject.subjectId, subjectId))
    .orderBy(
      asc(exam.year),
      asc(exam.name),
    );
}