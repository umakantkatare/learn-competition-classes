"use server";

import { revalidatePath } from "next/cache";

import {
  createTopic,
  setTopicStatus,
  updateTopic,
} from "@/services/academic/topic/mutations";

import { getSubjectById } from "@/services/academic/subject/queries";

import {
  createTopicSchema,
  updateTopicSchema,
} from "@/validations/academic/topic/topic-validation";
import { requireAcademicWriteAccess } from "@/lib/authorization/academic";

export async function createTopicAction(input: unknown) {
  try {
    await requireAcademicWriteAccess();

    const parsed = createTopicSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid topic data.",
      };
    }

    const subject = await getSubjectById(parsed.data.subjectId);

    if (!subject) {
      return {
        success: false,
        error: "Subject not found.",
      };
    }

    const newTopic = await createTopic(parsed.data);

    revalidatePath("/academic/topics");
    revalidatePath(`/academic/subjects/${subject.id}`);

    return {
      success: true,
      data: newTopic,
    };
  } catch (error) {
    console.error("Create topic error:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        error: "A topic with this slug already exists for this subject.",
      };
    }

    return {
      success: false,
      error: "Unable to create topic.",
    };
  }
}

export async function updateTopicAction(id: string, input: unknown) {
  try {
    await requireAcademicWriteAccess();

    const parsed = updateTopicSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid topic data.",
      };
    }

    const subject = await getSubjectById(parsed.data.subjectId);

    if (!subject) {
      return {
        success: false,
        error: "Subject not found.",
      };
    }

    const updatedTopic = await updateTopic(id, parsed.data);

    if (!updatedTopic) {
      return {
        success: false,
        error: "Topic not found.",
      };
    }

    revalidatePath("/academic/topics");
    revalidatePath(`/academic/topics/${id}`);
    revalidatePath(`/academic/subjects/${subject.id}`);

    return {
      success: true,
      data: updatedTopic,
    };
  } catch (error) {
    console.error("Update topic error:", error);

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return {
        success: false,
        error: "A topic with this slug already exists for this subject.",
      };
    }

    return {
      success: false,
      error: "Unable to update topic.",
    };
  }
}

export async function setTopicStatusAction(id: string, isActive: boolean) {
  try {
    await requireAcademicWriteAccess();

    const updatedTopic = await setTopicStatus(id, isActive);

    if (!updatedTopic) {
      return {
        success: false,
        error: "Topic not found.",
      };
    }

    revalidatePath("/academic/topics");
    revalidatePath(`/academic/topics/${id}`);
    revalidatePath(`/academic/subjects/${updatedTopic.subjectId}`);

    return {
      success: true,
      data: updatedTopic,
    };
  } catch (error) {
    console.error("Set topic status error:", error);

    return {
      success: false,
      error: "Unable to update topic status.",
    };
  }
}
