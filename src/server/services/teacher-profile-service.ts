import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";

import {
  createTeacherProfileSchema,
  updateTeacherProfileSchema,
} from "@/validations/teacher-profile-validation";

import type {
  CreateTeacherProfileInput,
  UpdateTeacherProfileInput,
} from "@/validations/teacher-profile-validation";

import {
  findTeacherProfileByUserId,
  insertTeacherProfile,
  updateTeacherProfileByUserId,
  deleteTeacherProfileByUserId,
  findAllTeacherProfiles,
} from "@/server/repositories/teacher-profile-repository";

export async function getAllTeacherProfiles() {
  return findAllTeacherProfiles();
}

export async function getTeacherProfile(userId: string) {
  const profile = await findTeacherProfileByUserId(userId);

  if (!profile) {
    throw new Error("TEACHER_PROFILE_NOT_FOUND");
  }

  return profile;
}

export async function createTeacherProfile(input: CreateTeacherProfileInput) {
  const parsed = createTeacherProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("INVALID_TEACHER_PROFILE_DATA");
  }

  const data = parsed.data;

  const [existingUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, data.userId))
    .limit(1);

  if (!existingUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const existingProfile = await findTeacherProfileByUserId(data.userId);

  if (existingProfile) {
    throw new Error("TEACHER_PROFILE_ALREADY_EXISTS");
  }

  return insertTeacherProfile(data);
}

export async function updateTeacherProfile(
  userId: string,
  input: UpdateTeacherProfileInput,
) {
  const parsed = updateTeacherProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error("INVALID_TEACHER_PROFILE_DATA");
  }

  const existingProfile = await findTeacherProfileByUserId(userId);

  if (!existingProfile) {
    throw new Error("TEACHER_PROFILE_NOT_FOUND");
  }

  const updatedProfile = await updateTeacherProfileByUserId(
    userId,
    parsed.data,
  );

  if (!updatedProfile) {
    throw new Error("TEACHER_PROFILE_NOT_FOUND");
  }

  return updatedProfile;
}

export async function removeTeacherProfile(userId: string) {
  const profile = await deleteTeacherProfileByUserId(userId);

  if (!profile) {
    throw new Error("TEACHER_PROFILE_NOT_FOUND");
  }

  return profile;
}


