import { db } from "@/db";
import { managerProfiles } from "@/db/schema/academic-schema";
import { user } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

// ============================================
// TYPES
// ============================================

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
  image: string | null;
  avatarFileId: string | null;
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

// ============================================
// MANAGER REPOSITORY
// ============================================

export class ManagerRepository {
  // CREATE MANAGER PROFILE

  async create(data: NewManagerProfile): Promise<ManagerProfile> {
    const [result] = await db.insert(managerProfiles).values(data).returning();

    if (!result) {
      throw new Error("Failed to create manager profile.");
    }

    return result;
  }

  // GET ALL MANAGERS WITH USER INFORMATION

  async findAll(): Promise<ManagerListItem[]> {
    return db
      .select({
        managerProfileId: managerProfiles.id,
        userId: managerProfiles.userId,

        name: user.name,
        email: user.email,
        phone: user.phoneNumber,

        // Profile image fields
        image: user.image,
        avatarFileId: user.avatarFileId,

        employeeCode: managerProfiles.employeeCode,
      })
      .from(managerProfiles)
      .innerJoin(user, eq(managerProfiles.userId, user.id));
  }

  // GET MANAGER BY PROFILE ID

  async findById(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .limit(1);

    return result;
  }

  // GET MANAGER BY USER ID

  async findByUserId(userId: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .select()
      .from(managerProfiles)
      .where(eq(managerProfiles.userId, userId))
      .limit(1);

    return result;
  }

  // GET MANAGER BY EMAIL

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

  // CHECK EXISTING USER EMAIL

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

  // UPDATE MANAGER PROFILE

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

  // UPDATE ASSOCIATED USER PROFILE

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

  // DELETE MANAGER PROFILE

  async delete(id: string): Promise<ManagerProfile | undefined> {
    const [result] = await db
      .delete(managerProfiles)
      .where(eq(managerProfiles.id, id))
      .returning();

    return result;
  }
}
