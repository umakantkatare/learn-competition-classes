import { auth } from "@/lib/auth";
import { ROLES } from "@/lib/permissions";
import { db } from "@/db";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

interface CreateTeacherAuthUserInput {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  image?: string | null;
  avatarFileId?: string | null;
  headers: Headers;
}

export async function createTeacherAuthUser({
  name,
  email,
  password,
  phoneNumber,
  image,
  avatarFileId,
  headers,
}: CreateTeacherAuthUserInput) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName || !normalizedEmail || !password) {
    throw new Error("Name, email, and password are required.");
  }

  const newUser = await auth.api.createUser({
    body: {
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: ROLES.TEACHER,
      data: {
        phoneNumber: phoneNumber.trim(),
        ...(image ? { image } : {}),
        ...(avatarFileId ? { avatarFileId } : {}),
      },
    },
    headers,
  });

  const userId = newUser?.user?.id;

  if (!userId) {
    throw new Error("Failed to create teacher authentication account.");
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning({
      id: user.id,
      emailVerified: user.emailVerified,
    });

  if (!updatedUser || updatedUser.emailVerified !== true) {
    throw new Error("Failed to verify teacher email.");
  }

  return {
    id: newUser.user.id,
    name: newUser.user.name,
    email: newUser.user.email,
  };
}
