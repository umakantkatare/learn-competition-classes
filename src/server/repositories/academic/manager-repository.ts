import { db } from "@/db";
import { managerProfiles } from "@/db/schema/academic-schema";
import { eq } from "drizzle-orm";

export type ManagerProfile = typeof managerProfiles.$inferSelect;
export type NewManagerProfile = typeof managerProfiles.$inferInsert;

export type UpdateManagerProfile = Partial<
  Omit<NewManagerProfile, "id" | "userId">
>;

export class ManagerRepository {
  // Create manager profile
  async create(data: NewManagerProfile): Promise<ManagerProfile> {
    const [result] = await db.insert(managerProfiles).values(data).returning();

    if (!result) {
      throw new Error("Failed to create manager profile");
    }

    return result;
  }

  // Get all manager profiles
  async findAll(): Promise<ManagerProfile[]> {
    return await db.select().from(managerProfiles);
  }

  // Find manager by profile ID
  async findById(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .limit(1);

    return result;
  }

  // Find manager by user ID
  async findByUserId(userId: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.userId, userId))
      .limit(1);

    return result;
  }

  // Update manager profile
  async update(
    id: string,
    data: UpdateManagerProfile,
  ): Promise<ManagerProfile | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update a manager profile",
      );
    }

    const [result] = await db
      .update(managerProfiles)
      .set(data)
      .where(eq(managerProfiles.id, id))
      .returning();

    return result;
  }

  // Delete manager profile
  async delete(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .delete(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .returning();

    return result;
  }
}
