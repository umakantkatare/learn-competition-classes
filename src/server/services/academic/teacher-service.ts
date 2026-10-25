import {
  TeacherRepository,
  NewTeacherProfile,
  UpdateTeacherProfile,
} from "@/server/repositories/academic/teacher-repository";

export class TeacherService {
  private readonly teacherRepo: TeacherRepository;

  constructor() {
    this.teacherRepo = new TeacherRepository();
  }

  // Create teacher profile
  async createProfile(data: NewTeacherProfile) {
    // One teacher profile per user
    const existingProfile = await this.teacherRepo.findByUserId(data.userId);

    if (existingProfile) {
      throw new Error("A teacher profile already exists for this user.");
    }

    // Validate experience
    if (
      !Number.isFinite(Number(data.experienceYears)) ||
      Number(data.experienceYears) < 0
    ) {
      throw new Error("Experience years must be a valid non-negative number.");
    }

    return this.teacherRepo.create(data);
  }

  // Get all teacher profiles
  async getAllTeachers() {
    const teachers = await this.teacherRepo.findAll();

    return teachers;
  }

  // Get profile by profile ID
  async getProfileById(id: string) {
    const profile = await this.teacherRepo.findById(id);

    if (!profile) {
      throw new Error("Teacher profile not found.");
    }

    return profile;
  }

  // Get profile by authenticated user ID
  async getProfileByUserId(userId: string) {
    const profile = await this.teacherRepo.findByUserId(userId);

    if (!profile) {
      throw new Error("Teacher profile not found for this user.");
    }

    return profile;
  }

  // Update teacher profile
  async updateProfile(id: string, data: UpdateTeacherProfile) {
    const existingProfile = await this.teacherRepo.findById(id);

    if (!existingProfile) {
      throw new Error("Teacher profile not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update the profile.");
    }

    if (
      data.experienceYears !== undefined &&
      (!Number.isFinite(Number(data.experienceYears)) ||
        Number(data.experienceYears) < 0)
    ) {
      throw new Error("Experience years must be a valid non-negative number.");
    }

    const updatedProfile = await this.teacherRepo.update(id, data);

    if (!updatedProfile) {
      throw new Error("Failed to update teacher profile.");
    }

    return updatedProfile;
  }

  async deleteProfile(id: string) {
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
