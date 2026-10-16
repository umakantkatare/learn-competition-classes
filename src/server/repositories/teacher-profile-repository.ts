import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { teacherProfiles } from "@/db/schema/teacher-profile-schema";

import type {
  CreateTeacherProfileInput,
  UpdateTeacherProfileInput,
} from "@/validations/teacher-profile-validation";

export async function findAllTeacherProfiles() {
  return db
    .select()
    .from(teacherProfiles)
    .orderBy(desc(teacherProfiles.createdAt));
}

export async function findTeacherProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(teacherProfiles)
    .where(eq(teacherProfiles.userId, userId))
    .limit(1);

  return profile ?? null;
}

export async function insertTeacherProfile(data: CreateTeacherProfileInput) {
  const [profile] = await db
    .insert(teacherProfiles)
    .values({
      userId: data.userId,
      bio: data.bio ?? null,
      qualification: data.qualification ?? null,
      experienceYears: data.experienceYears,
      specializations: data.specializations,
    })
    .returning();

  return profile;
}

export async function updateTeacherProfileByUserId(
  userId: string,
  data: UpdateTeacherProfileInput,
) {
  const [profile] = await db
    .update(teacherProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(teacherProfiles.userId, userId))
    .returning();

  return profile ?? null;
}

export async function deleteTeacherProfileByUserId(userId: string) {
  const [profile] = await db
    .delete(teacherProfiles)
    .where(eq(teacherProfiles.userId, userId))
    .returning();

  return profile ?? null;
}
