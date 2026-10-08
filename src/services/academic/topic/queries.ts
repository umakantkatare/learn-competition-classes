import { asc, desc, eq, and } from "drizzle-orm";

import { db } from "@/db";
import { topic } from "@/db/schema/topic-schema";
import { subject } from "@/db/schema/subject-schema";

export async function getTopics() {
  return db
    .select({
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      isActive: topic.isActive,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,

      subject: {
        id: subject.id,
        name: subject.name,
      },
    })
    .from(topic)
    .innerJoin(subject, eq(topic.subjectId, subject.id))
    .orderBy(desc(topic.createdAt), asc(topic.name));
}

export async function getTopicById(id: string) {
  const [result] = await db
    .select()
    .from(topic)
    .where(eq(topic.id, id))
    .limit(1);

  return result ?? null;
}

export async function getTopicsBySubjectId(subjectId: string) {
  return db
    .select()
    .from(topic)
    .where(eq(topic.subjectId, subjectId))
    .orderBy(asc(topic.name));
}

export async function getActiveTopics() {
  return db
    .select()
    .from(topic)
    .where(eq(topic.isActive, true))
    .orderBy(asc(topic.name));
}

export async function getActiveTopicsBySubjectId(subjectId: string) {
  return db
    .select()
    .from(topic)
    .where(and(eq(topic.subjectId, subjectId), eq(topic.isActive, true)))
    .orderBy(asc(topic.name));
}
