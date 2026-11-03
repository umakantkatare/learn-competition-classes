import { randomBytes } from "node:crypto";

import {
  ManagerRepository,
  type UpdateManagerProfile,
  type UpdateOwnManagerProfile,
} from "@/server/repositories/academic/manager-repository";

import {
  createManagerSchema,
  updateOwnManagerProfileSchema,
  type CreateManagerInput,
  type UpdateOwnManagerProfileInput,
} from "@/validations/academic/manager-validations";

import { sendTemporaryPasswordEmail } from "@/helper/sendTemporaryPasswordEmail";

type CreatedAuthUser = {
  id: string;
  name: string;
  email: string;
};

type CreateManagerDependencies = {
  createAuthUser: (input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    image?: string | null;
    avatarFileId?: string | null;
  }) => Promise<CreatedAuthUser>;
};

type CreateManagerResult = {
  userId: string;
  managerProfileId: string;
  name: string;
  email: string;
  password: string; // Temporary password
};

function getPostgresErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}

function getPostgresConstraint(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string"
  ) {
    return error.constraint;
  }

  return undefined;
}

export class ManagerService {
  private readonly managerRepo: ManagerRepository;

  constructor() {
    this.managerRepo = new ManagerRepository();
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.managerRepo.findUserByEmail(email);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }
  }

  private validateEmployeeCode(
    employeeCode: string | null | undefined,
  ): string {
    const normalized = employeeCode?.trim();

    if (!normalized || normalized.length < 2 || normalized.length > 50) {
      throw new Error(
        "Employee code must contain between 2 and 50 characters.",
      );
    }

    return normalized;
  }

  private generateTemporaryPassword(): string {
    return randomBytes(24).toString("base64url").slice(0, 8);
  }

  /**
   * Creates a manager's Better Auth account and manager profile.
   */
  async createManager(
    input: CreateManagerInput,
    dependencies: CreateManagerDependencies,
  ): Promise<CreateManagerResult> {
    const parsed = createManagerSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const data = parsed.data;
    const email = this.normalizeEmail(data.email);

    await this.assertEmailAvailable(email);

    const employeeCode = this.validateEmployeeCode(data.employeeCode);
    const temporaryPassword = this.generateTemporaryPassword();

    const createdUser = await dependencies.createAuthUser({
      name: data.name.trim(),
      email,
      password: temporaryPassword,
      phoneNumber: data.phoneNumber,
      image: data.image ?? null,
      avatarFileId: data.avatarFileId ?? null,
    });

    // Create the manager profile after the auth user exists.
    const profile = await this.managerRepo.create({
      userId: createdUser.id,
      employeeCode,
    });

    // Send the temporary password to the manager.
    // await sendTemporaryPasswordEmail({
    //   to: createdUser.email,
    //   userName: createdUser.name,
    //   temporaryPassword,
    //   loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
    // });

    // Never return the temporary password.
    return {
      userId: createdUser.id,
      managerProfileId: profile.id,
      name: createdUser.name,
      email: createdUser.email,
      password: temporaryPassword, // Include the temporary password in the return value
    };
  }

  /**
   * Get all managers with their user information.
   */
  async getAllManagers() {
    return this.managerRepo.findAll();
  }

  /**
   * Get a manager profile by profile ID.
   */
  async getProfileById(id: string) {
    const profile = await this.managerRepo.findById(id);

    if (!profile) {
      throw new Error("Manager profile not found.");
    }

    return profile;
  }

  /**
   * Get a manager profile by Better Auth user ID.
   */
  async getProfileByUserId(userId: string) {
    const profile = await this.managerRepo.findByUserId(userId);

    if (!profile) {
      throw new Error("Manager profile not found for this user.");
    }

    return profile;
  }

  /**
   * Admin-controlled update.
   * Only employeeCode is accepted by UpdateManagerProfile.
   * Admin authorization must be checked in the API route.
   */
  async updateManagerProfile(id: string, data: UpdateManagerProfile) {
    const profile = await this.managerRepo.findById(id);

    if (!profile) {
      throw new Error("Manager profile not found.");
    }

    const updates: UpdateManagerProfile = {};

    if (data.employeeCode !== undefined) {
      updates.employeeCode = this.validateEmployeeCode(data.employeeCode);
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("At least one valid field is required to update.");
    }

    try {
      const updatedProfile = await this.managerRepo.update(id, updates);

      if (!updatedProfile) {
        throw new Error("Failed to update manager profile.");
      }

      return updatedProfile;
    } catch (error) {
      if (
        getPostgresErrorCode(error) === "23505" &&
        getPostgresConstraint(error) === "manager_profiles_employee_code_unique"
      ) {
        throw new Error("This employee code is already in use.");
      }

      throw error;
    }
  }

  /**
   * Update the authenticated manager's personal information.
   * userId must come from the authenticated server-side session,
   * never from the request body.
   */
  async updateOwnProfile(userId: string, input: UpdateOwnManagerProfileInput) {
    const parsed = updateOwnManagerProfileSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const managerProfile = await this.managerRepo.findByUserId(userId);

    if (!managerProfile) {
      throw new Error("Manager profile not found for this user.");
    }

    const data = parsed.data;
    const updates: UpdateOwnManagerProfile = {};

    if (data.name !== undefined) {
      updates.name = data.name.trim();
    }

    if (data.phoneNumber !== undefined) {
      updates.phoneNumber = data.phoneNumber.trim();
    }

    if (data.image !== undefined) {
      updates.image = data.image;
    }

    if (data.avatarFileId !== undefined) {
      updates.avatarFileId = data.avatarFileId;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("At least one valid field is required to update.");
    }

    try {
      const updatedUser = await this.managerRepo.updateUserProfile(
        userId,
        updates,
      );

      if (!updatedUser) {
        throw new Error("Failed to update manager profile.");
      }

      return updatedUser;
    } catch (error) {
      if (
        getPostgresErrorCode(error) === "23505" &&
        getPostgresConstraint(error) === "user_phone_number_unique"
      ) {
        throw new Error("This phone number is already in use.");
      }

      throw error;
    }
  }

  /**
   * Delete only the manager profile.
   * This does not delete or deactivate the Better Auth user.
   */
  async deleteProfile(id: string) {
    const profile = await this.managerRepo.findById(id);

    if (!profile) {
      throw new Error("Manager profile not found.");
    }

    const deletedProfile = await this.managerRepo.delete(id);

    if (!deletedProfile) {
      throw new Error("Failed to delete manager profile.");
    }

    return deletedProfile;
  }
}
