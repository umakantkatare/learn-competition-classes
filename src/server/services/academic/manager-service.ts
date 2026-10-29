import {
  ManagerRepository,
  NewManagerProfile,
  UpdateManagerProfile,
} from "@/server/repositories/academic/manager-repository";

export class ManagerService {
  private readonly managerRepo: ManagerRepository;

  constructor() {
    this.managerRepo = new ManagerRepository();
  }

  // Create manager profile
  async createProfile(data: NewManagerProfile) {
    // One manager profile per user
    const existingProfile = await this.managerRepo.findByUserId(data.userId);

    if (existingProfile) {
      throw new Error("A manager profile already exists for this user.");
    }

    // Validate department
    if (
      typeof data.department !== "string" ||
      data.department.trim().length < 2
    ) {
      throw new Error("Department must contain at least 2 characters.");
    }

    // Validate employee code
    if (
      data.employeeCode !== undefined &&
      data.employeeCode !== null &&
      (typeof data.employeeCode !== "string" ||
        data.employeeCode.trim().length < 2)
    ) {
      throw new Error("Employee code must contain at least 2 characters.");
    }

    return this.managerRepo.create({
      ...data,
      department: data.department.trim(),
      employeeCode: data.employeeCode?.trim() || data.employeeCode,
    });
  }

  // Get all manager profiles
  async getAllManagers() {
    return this.managerRepo.findAll();
  }

  // Get profile by profile ID
  async getProfileById(id: string) {
    const profile = await this.managerRepo.findById(id);

    if (!profile) {
      throw new Error("Manager profile not found.");
    }

    return profile;
  }

  // Get profile by authenticated user ID
  async getProfileByUserId(userId: string) {
    const profile = await this.managerRepo.findByUserId(userId);

    if (!profile) {
      throw new Error("Manager profile not found for this user.");
    }

    return profile;
  }

  // Update manager profile
  async updateProfile(id: string, data: UpdateManagerProfile) {
    const existingProfile = await this.managerRepo.findById(id);

    if (!existingProfile) {
      throw new Error("Manager profile not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update the manager profile.",
      );
    }

    // Validate department
    if (
      data.department !== undefined &&
      (typeof data.department !== "string" || data.department.trim().length < 2)
    ) {
      throw new Error("Department must contain at least 2 characters.");
    }

    // Validate employee code
    if (
      data.employeeCode !== undefined &&
      data.employeeCode !== null &&
      (typeof data.employeeCode !== "string" ||
        data.employeeCode.trim().length < 2)
    ) {
      throw new Error("Employee code must contain at least 2 characters.");
    }

    const updateData: UpdateManagerProfile = {
      ...data,
      ...(data.department !== undefined && {
        department: data.department.trim(),
      }),
      ...(data.employeeCode !== undefined &&
        data.employeeCode !== null && {
          employeeCode: data.employeeCode.trim(),
        }),
    };

    const updatedProfile = await this.managerRepo.update(id, updateData);

    if (!updatedProfile) {
      throw new Error("Failed to update manager profile.");
    }

    return updatedProfile;
  }

  // Delete manager profile
  async deleteProfile(id: string) {
    const existingProfile = await this.managerRepo.findById(id);

    if (!existingProfile) {
      throw new Error("Manager profile not found.");
    }

    const deletedProfile = await this.managerRepo.delete(id);

    if (!deletedProfile) {
      throw new Error("Failed to delete manager profile.");
    }

    return deletedProfile;
  }
}
