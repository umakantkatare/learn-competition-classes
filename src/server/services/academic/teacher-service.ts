import { randomBytes } from "node:crypto";

import {
  TeacherRepository,
  TeacherWithUser,
  type TeacherProfile,
  type UpdateTeacherProfileData,
} from "@/server/repositories/academic/teacher-repository";

import {
  createTeacherSchema,
  updateTeacherSchema,
  type CreateTeacherInput,
  type UpdateTeacherPayload,
} from "@/validations/academic/teacher-validations";

type CreatedAuthUser = {
  id: string;
  name: string;
  email: string;
};

type CreateTeacherDependencies = {
  createAuthUser: (input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    image?: string | null;
    avatarFileId?: string | null;
  }) => Promise<CreatedAuthUser>;
};

type CreateTeacherResult = {
  userId: string;
  teacherProfileId: string;
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  image: string | null;
  avatarFileId: string | null;
  subject: string[];
  experienceYears: number;
  qualification: string | null;
  bio: string | null;
};

export class TeacherService {
  private readonly teacherRepo: TeacherRepository;

  constructor() {
    this.teacherRepo = new TeacherRepository();
  }

  // Normalize email
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  // Check duplicate email
  private async assertEmailAvailable(email: string): Promise<void> {
    const existingUser = await this.teacherRepo.findUserByEmail(email);

    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }
  }

  // Validate experience
  private validateExperience(experienceYears: number): number {
    if (
      !Number.isFinite(experienceYears) ||
      !Number.isInteger(experienceYears) ||
      experienceYears < 0 ||
      experienceYears > 60
    ) {
      throw new Error(
        "Experience years must be a valid integer between 0 and 60.",
      );
    }

    return experienceYears;
  }

  // Generate temporary password
  private generateTemporaryPassword(): string {
    return randomBytes(24).toString("base64url");
  }

  /**
   * Create Better Auth account and teacher profile.
   */
  async createProfile(
    input: CreateTeacherInput,
    dependencies: CreateTeacherDependencies,
  ): Promise<CreateTeacherResult> {
    // 1. Validate input
    const parsed = createTeacherSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const data = parsed.data;

    // 2. Normalize email
    const email = this.normalizeEmail(data.email);

    // 3. Check duplicate email
    await this.assertEmailAvailable(email);

    // 4. Validate experience
    const experienceYears = this.validateExperience(data.experienceYears);

    // 5. Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();

    // 6. Create Better Auth user
    const createdUser = await dependencies.createAuthUser({
      name: data.name.trim(),
      email,
      password: temporaryPassword,
      phoneNumber: data.phoneNumber.trim(),
      image: data.image ?? null,
      avatarFileId: data.avatarFileId ?? null,
    });

    // 7. Create teacher profile
    const profile = await this.teacherRepo.create({
      userId: createdUser.id,
      subject: data.subject,
      experienceYears,
      qualification: data.qualification ?? null,
      bio: data.bio ?? null,
    });

    // 8. Return safe response
    return {
      userId: createdUser.id,
      teacherProfileId: profile.id,
      name: createdUser.name,
      email: createdUser.email,
      password: temporaryPassword,
      phoneNumber: data.phoneNumber,
      image: data.image ?? null,
      avatarFileId: data.avatarFileId ?? null,
      subject: profile.subject,
      experienceYears: profile.experienceYears,
      qualification: profile.qualification,
      bio: profile.bio,
    };
  }

  // Get all teacher profiles
  async getAllTeachers(): Promise<TeacherWithUser[]> {
    return this.teacherRepo.findAll();
  }

  // Get profile by profile ID
  async getProfileById(id: string): Promise<TeacherProfile> {
    const profile = await this.teacherRepo.findById(id);

    if (!profile) {
      throw new Error("Teacher profile not found.");
    }

    return profile;
  }

  // Get profile by authenticated user ID
  async getProfileByUserId(userId: string): Promise<TeacherProfile> {
    const profile = await this.teacherRepo.findByUserId(userId);

    if (!profile) {
      throw new Error("Teacher profile not found for this user.");
    }

    return profile;
  }

  // Update teacher profile
  async updateProfile(
    id: string,
    input: UpdateTeacherPayload,
  ): Promise<TeacherProfile> {
    // 1. Check existing profile
    const existingProfile = await this.teacherRepo.findById(id);

    if (!existingProfile) {
      throw new Error("Teacher profile not found.");
    }

    // 2. Validate update input
    const parsed = updateTeacherSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues.map((issue) => issue.message).join(", "),
      );
    }

    const data = parsed.data;

    // 3. Allow only teacher-specific fields
    const allowedFields = [
      "subject",
      "experienceYears",
      "qualification",
      "bio",
    ];

    const invalidFields = Object.keys(data).filter(
      (key) => !allowedFields.includes(key),
    );

    if (invalidFields.length > 0) {
      throw new Error(
        `These fields cannot be updated through teacher profile: ${invalidFields.join(", ")}`,
      );
    }

    // 4. Prepare update payload
    const updates: UpdateTeacherProfileData = {};

    if (data.subject !== undefined) {
      updates.subject = data.subject;
    }

    if (data.experienceYears !== undefined) {
      updates.experienceYears = this.validateExperience(data.experienceYears);
    }

    if (data.qualification !== undefined) {
      updates.qualification = data.qualification;
    }

    if (data.bio !== undefined) {
      updates.bio = data.bio;
    }

    // 5. Check empty updates
    if (Object.keys(updates).length === 0) {
      throw new Error(
        "At least one valid field is required to update the teacher profile.",
      );
    }

    // 6. Update repository
    const updatedProfile = await this.teacherRepo.update(id, updates);

    if (!updatedProfile) {
      throw new Error("Failed to update teacher profile.");
    }

    return updatedProfile;
  }

  // Delete teacher profile
  async deleteProfile(id: string): Promise<TeacherProfile> {
    const existingProfile = await this.teacherRepo.findById(id);

    if (!existingProfile) {
      throw new Error("Teacher profile not found.");
    }

    const deletedProfile = await this.teacherRepo.delete(id);

    if (!deletedProfile) {
      throw new Error("Failed to delete teacher profile.");
    }

    return deletedProfile;
  }
}
