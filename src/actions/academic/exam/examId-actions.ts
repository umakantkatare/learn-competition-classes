"use server";

import { revalidatePath } from "next/cache";

import { requireAcademicWriteAccess } from "@/lib/authorization/academic";

import {
  assignSubjectToExam,
  removeSubjectFromExam,
} from "@/services/academic/exam-subject/mutations";

import { getExamById } from "@/services/academic/exam/queries";
import { getSubjectById } from "@/services/academic/subject/queries";

import { z } from "zod";

const examSubjectSchema = z.object({
  examId: z.string().min(1, "Exam ID is required."),
  subjectId: z.string().min(1, "Subject ID is required."),
});

export async function assignSubjectToExamAction(input: unknown) {
  await requireAcademicWriteAccess();

  const parsed = examSubjectSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid subject assignment data.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { examId, subjectId } = parsed.data;

  try {
    const [exam, subject] = await Promise.all([
      getExamById(examId),
      getSubjectById(subjectId),
    ]);

    if (!exam) {
      return {
        success: false,
        error: "Exam not found.",
      };
    }

    if (!subject) {
      return {
        success: false,
        error: "Subject not found.",
      };
    }

    if (!subject.isActive) {
      return {
        success: false,
        error: "Inactive subjects cannot be assigned.",
      };
    }

    await assignSubjectToExam({
      examId,
      subjectId,
    });

    revalidatePath(`/academic/exams/${examId}`);
    revalidatePath(`/academic/subjects/${subjectId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Assign subject to exam error:", error);

    return {
      success: false,
      error: "Unable to assign subject to exam.",
    };
  }
}

export async function removeSubjectFromExamAction(
  examId: string,
  subjectId: string,
) {
  await requireAcademicWriteAccess();

  const parsed = examSubjectSchema.safeParse({
    examId,
    subjectId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: "Invalid subject assignment data.",
    };
  }

  try {
    const removedAssignment = await removeSubjectFromExam(
      parsed.data.examId,
      parsed.data.subjectId,
    );

    if (!removedAssignment) {
      return {
        success: false,
        error: "Subject assignment not found.",
      };
    }

    revalidatePath(`/academic/exams/${examId}`);
    revalidatePath(`/academic/subjects/${subjectId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Remove subject from exam error:", error);

    return {
      success: false,
      error: "Unable to remove subject from exam.",
    };
  }
}
