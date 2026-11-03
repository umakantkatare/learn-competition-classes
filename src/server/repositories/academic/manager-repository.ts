import { db } from "@/db";
import { managerProfiles } from "@/db/schema/academic-schema";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

export type ManagerProfile = typeof managerProfiles.$inferSelect;
export type NewManagerProfile = typeof managerProfiles.$inferInsert;

export type UpdateManagerProfile = Partial<
  Pick<NewManagerProfile, "employeeCode">
>;

export type ManagerListItem = {
  managerProfileId: string;
  name: string;
  email: string;
  phone: string | null;
  employeeCode: string;
  userId: string;
};

export type ManagerProfileWithUser = {
  id: string;
  userId: string;
  employeeCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateOwnManagerProfile = Partial<
  Pick<
    typeof user.$inferInsert,
    "name" | "phoneNumber" | "image" | "avatarFileId"
  >
>;

export type UpdatedManagerUser = Pick<
  typeof user.$inferSelect,
  "id" | "name" | "email" | "phoneNumber" | "image" | "avatarFileId"
>;

export class ManagerRepository {
  /**
   * Create a manager profile.
   * The corresponding Better Auth user must already exist.
   */
  async create(data: NewManagerProfile): Promise<ManagerProfile> {
    const [result] = await db.insert(managerProfiles).values(data).returning();

    if (!result) {
      throw new Error("Failed to create manager profile.");
    }

    return result;
  }

  /**
   * Get all manager profiles with basic user information.
   */
  async findAll(): Promise<ManagerListItem[]> {
    return db
      .select({
        managerProfileId: managerProfiles.id,
        name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        employeeCode: managerProfiles.employeeCode,
        userId: managerProfiles.userId,
      })
      .from(managerProfiles)
      .innerJoin(user, eq(managerProfiles.userId, user.id));
  }

  /**
   * Find a manager profile by its profile ID.
   */
  async findById(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .limit(1);

    return result;
  }

  /**
   * Find a manager profile by its associated user ID.
   */
  async findByUserId(userId: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.userId, userId))
      .limit(1);

    return result;
  }

  /**
   * Find a manager profile by email.
   */
  async findByEmail(
    email: string,
  ): Promise<ManagerProfileWithUser | undefined> {
    const normalizedEmail = email.trim().toLowerCase();

    const [result] = await db
      .select({
        id: managerProfiles.id,
        userId: managerProfiles.userId,
        employeeCode: managerProfiles.employeeCode,
        createdAt: managerProfiles.createdAt,
        updatedAt: managerProfiles.updatedAt,
      })
      .from(managerProfiles)
      .innerJoin(user, eq(managerProfiles.userId, user.id))
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    return result;
  }

  async findUserByEmail(
    email: string,
  ): Promise<{ id: string; email: string } | undefined> {
    const existingEmail = email.trim().toLowerCase();

    const [result] = await db
      .select({
        id: user.id,
        email: user.email,
      })
      .from(user)
      .where(eq(user.email, existingEmail))
      .limit(1);

    return result;
  }

  /**
   * Update manager profile fields.
   */
  async update(
    id: string,
    data: UpdateManagerProfile,
  ): Promise<ManagerProfile | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update a manager profile.",
      );
    }

    const [result] = await db
      .update(managerProfiles)
      .set(data)
      .where(eq(managerProfiles.id, id))
      .returning();

    return result;
  }

  // Update the associated Better Auth user profile fields.
  async updateUserProfile(
    userId: string,
    data: UpdateOwnManagerProfile,
  ): Promise<UpdatedManagerUser | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update.");
    }

    const [result] = await db
      .update(user)
      .set(data)
      .where(eq(user.id, userId))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        image: user.image,
        avatarFileId: user.avatarFileId,
      });

    return result;
  }

  /**
   * Delete only the manager profile.
   * This does not delete the associated Better Auth user.
   */
  async delete(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .delete(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .returning();

    return result;
  }
}
