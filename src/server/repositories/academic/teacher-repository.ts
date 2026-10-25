import { db } from "@/db";
import { teacherProfiles } from "@/db/schema/academic-schema";
import { eq } from "drizzle-orm";

export type TeacherProfile = typeof teacherProfiles.$inferSelect;
export type NewTeacherProfile = typeof teacherProfiles.$inferInsert;

export type UpdateTeacherProfile = Partial<
  Omit<NewTeacherProfile, "id" | "userId">
>;

export class TeacherRepository {
  // Create teacher profile
  async create(data: NewTeacherProfile): Promise<TeacherProfile> {
    const [result] = await db.insert(teacherProfiles).values(data).returning();

    if (!result) {
      throw new Error("Failed to create teacher profile");
    }

    return result;
  }

  // Get all teacher profiles
  async findAll(): Promise<TeacherProfile[]> {
    return await db.select().from(teacherProfiles);
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

  // Update teacher profile
  async update(
    id: string,
    data: UpdateTeacherProfile,
  ): Promise<TeacherProfile | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update a teacher profile",
      );
    }

    const [result] = await db
      .update(teacherProfiles)
      .set(data)
      .where(eq(teacherProfiles.id, id))
      .returning();

    return result;
  }

  async delete(id: string): Promise<TeacherProfile | undefined> {
    const [result] = await db
      .delete(teacherProfiles)
      .where(eq(teacherProfiles.id, id))
      .returning();

    return result;
  }
}
