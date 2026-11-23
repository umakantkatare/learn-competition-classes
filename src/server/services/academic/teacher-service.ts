import { TeacherRepository } from "@/server/repositories/academic/teacher-repository";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "@/validations/academic/teacher-validations";

type CreateTeacherDependencies = {
  createAuthUser: (input: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    image?: string | null;
    avatarFileId?: string | null;
  }) => Promise<{ id: string }>;
};

export class TeacherService {
  constructor(private readonly teacherRepo = new TeacherRepository()) {}

  async createProfile(input: unknown, dependencies: CreateTeacherDependencies) {
    const parsed = createTeacherSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Invalid teacher data",
      );
    }

    const data = parsed.data;
    const email = data.email.trim().toLowerCase();

    const existingUser = await this.teacherRepo.findUserByEmail(email);

    if (existingUser) {
      throw new Error("A user with this email already exists");
    }

    if (data.experienceYears < 0) {
      throw new Error("Experience years cannot be negative");
    }

    const temporaryPassword = this.generateTemporaryPassword();

    const authUser = await dependencies.createAuthUser({
      name: data.name,
      email,
      password: temporaryPassword,
      phoneNumber: data.phoneNumber,
      image: data.image ?? null,
      avatarFileId: data.avatarFileId ?? null,
    });

    const teacher = await this.teacherRepo.create({
      userId: authUser.id,
      subject: data.subject,
      experienceYears: data.experienceYears,
      qualification: data.qualification,
      bio: data.bio,
    });

    return {
      ...teacher,
      userId: authUser.id,
      name: data.name,
      email,
      phone: data.phoneNumber,
      image: data.image ?? null,
      avatarFileId: data.avatarFileId ?? null,
      temporaryPassword,
    };
  }

  async getAllTeachers() {
    return this.teacherRepo.findAll();
  }

  async getProfileById(id: string) {
    const teacher = await this.teacherRepo.findById(id);

    if (!teacher) {
      throw new Error("Teacher profile not found");
    }

    return teacher;
  }

  async getProfileByUserId(userId: string) {
    const teacher = await this.teacherRepo.findByUserId(userId);

    if (!teacher) {
      throw new Error("Teacher profile not found");
    }

    return teacher;
  }

  async updateProfile(id: string, input: unknown) {
    const existingTeacher = await this.teacherRepo.findById(id);

    if (!existingTeacher) {
      throw new Error("Teacher profile not found");
    }

    const parsed = updateTeacherSchema.safeParse(input);

    if (!parsed.success) {
      throw new Error(
        parsed.error.issues[0]?.message ?? "Invalid teacher data",
      );
    }

    const data = parsed.data;

    if (data.experienceYears !== undefined && data.experienceYears < 0) {
      throw new Error("Experience years cannot be negative");
    }

    const updateData = {
      ...(data.subject !== undefined && {
        subject: data.subject,
      }),
      ...(data.experienceYears !== undefined && {
        experienceYears: data.experienceYears,
      }),
      ...(data.qualification !== undefined && {
        qualification: data.qualification,
      }),
      ...(data.bio !== undefined && {
        bio: data.bio,
      }),
    };

    if (Object.keys(updateData).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    return this.teacherRepo.update(id, updateData);
  }

  async deleteProfile(id: string) {
    const existingTeacher = await this.teacherRepo.findById(id);

    if (!existingTeacher) {
      throw new Error("Teacher profile not found");
    }

    await this.teacherRepo.delete(id);

    return {
      id,
      message: "Teacher profile deleted successfully",
    };
  }

  private generateTemporaryPassword(length = 12) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";

    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  }
}

export const teacherService = new TeacherService();
