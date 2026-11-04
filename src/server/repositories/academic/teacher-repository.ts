import { db } from "@/db";
import { teacherProfiles } from "@/db/schema/academic-schema";
import { user } from "@/db/schema/auth-schema";

import { eq } from "drizzle-orm";

import type {
  CreateTeacherPayload,
  UpdateTeacherPayload,
} from "@/validations/academic/teacher-validations";

export type TeacherWithUser = {
  id: TeacherProfile["id"];
  name: typeof user.$inferSelect.name;
  email: typeof user.$inferSelect.email;
  phone: typeof user.$inferSelect.phoneNumber;
  subject: TeacherProfile["subject"];
  experienceYears: TeacherProfile["experienceYears"];
  qualification: TeacherProfile["qualification"];
  bio: TeacherProfile["bio"];
};

export type TeacherProfile = typeof teacherProfiles.$inferSelect;

export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;

export type CreateTeacherProfileData = Pick<
  CreateTeacherPayload,
  "subject" | "experienceYears" | "qualification" | "bio"
> & {
  userId: string;
};

export type UpdateTeacherProfileData = Pick<
  UpdateTeacherPayload,
  "subject" | "experienceYears" | "qualification" | "bio"
>;

export class TeacherRepository {
  async create(data: CreateTeacherProfileData): Promise<TeacherProfile> {
    const [result] = await db.insert(teacherProfiles).values(data).returning();

    if (!result) {
      throw new Error("Failed to create teacher profile.");
    }

    return result;
  }

  // Get all teacher profiles
  async findAll(): Promise<TeacherWithUser[]> {
    return db
      .select({
        id: teacherProfiles.id,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        subject: teacherProfiles.subject,
        experienceYears: teacherProfiles.experienceYears,
        qualification: teacherProfiles.qualification,
        bio: teacherProfiles.bio,
      })
      .from(teacherProfiles)
      .innerJoin(user, eq(teacherProfiles.userId, user.id));
  }

  // Find teacher by profile ID
  async findById(id: string): Promise<TeacherProfile | undefined> {
    const [result] = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.id, id))
      .limit(1);

    return result;
  }

  // Find teacher by user ID
  async findByUserId(userId: string): Promise<TeacherProfile | undefined> {
    const [result] = await db
      .select()
      .from(teacherProfiles)
      .where(eq(teacherProfiles.userId, userId))
      .limit(1);

    return result;
  }

  // Check email in Better Auth user table
  async findUserByEmail(
    email: string,
  ): Promise<{ id: string; email: string } | undefined> {
    const normalizedEmail = email.trim().toLowerCase();

    const [result] = await db
      .select({
        id: user.id,
        email: user.email,
      })
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    return result;
  }

  // Update teacher profile
  async update(
    id: string,
    data: UpdateTeacherProfileData,
  ): Promise<TeacherProfile | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update a teacher profile.",
      );
    }

    const [result] = await db
      .update(teacherProfiles)
      .set(data)
      .where(eq(teacherProfiles.id, id))
      .returning();

    return result;
  }

  // Delete teacher profile
  async delete(id: string): Promise<TeacherProfile | undefined> {
    const [result] = await db
      .delete(teacherProfiles)
      .where(eq(teacherProfiles.id, id))
      .returning();

    return result;
  }
}
