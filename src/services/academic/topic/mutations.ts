import { eq } from "drizzle-orm";

import { db } from "@/db";
import { topic } from "@/db/schema/topic-schema";
import {
  createTopicSchema,
  updateTopicSchema,
  type CreateTopicInput,
  type UpdateTopicInput,
} from "@/validations/academic/topic/topic-validation";

export async function createTopic(input: CreateTopicInput) {
  const data = createTopicSchema.parse(input);

  const [newTopic] = await db
    .insert(topic)
    .values({
      id: crypto.randomUUID(),
      subjectId: data.subjectId,
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
    })
    .returning();

  return newTopic;
}

export async function updateTopic(id: string, input: UpdateTopicInput) {
  const data = updateTopicSchema.parse(input);

  const [updatedTopic] = await db
    .update(topic)
    .set({
      subjectId: data.subjectId,
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
      updatedAt: new Date(),
    })
    .where(eq(topic.id, id))
    .returning();

  return updatedTopic ?? null;
}

export async function setTopicStatus(id: string, isActive: boolean) {
  const [updatedTopic] = await db
    .update(topic)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(topic.id, id))
    .returning();

  return updatedTopic ?? null;
}
