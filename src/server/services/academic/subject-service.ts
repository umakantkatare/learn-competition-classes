import {
  SubjectRepository,
  NewSubject,
  UpdateSubject,
} from "@/server/repositories/academic/subject-repository";

export class SubjectService {
  private readonly subjectRepo: SubjectRepository;

  constructor() {
    this.subjectRepo = new SubjectRepository();
  }

  // Create subject
  async createSubject(data: NewSubject) {
    const name = data.name?.trim();

    if (!name) {
      throw new Error("Subject name cannot be empty.");
    }

    return this.subjectRepo.create({
      ...data,
      name,
    });
  }

  // Get subject by ID
  async getSubjectById(id: string) {
    const subject = await this.subjectRepo.findById(id);

    if (!subject) {
      throw new Error("Subject not found.");
    }

    return subject;
  }

  // Get all subjects
  async getAllSubjects() {
    return this.subjectRepo.findAll();
  }

  // Update subject
  async updateSubject(id: string, data: UpdateSubject) {
    const existingSubject = await this.subjectRepo.findById(id);

    if (!existingSubject) {
      throw new Error("Subject not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a subject.");
    }

    const updateData: UpdateSubject = { ...data };

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        throw new Error("Subject name cannot be empty.");
      }

      updateData.name = name;
    }

    const updatedSubject = await this.subjectRepo.update(id, updateData);

    if (!updatedSubject) {
      throw new Error("Failed to update subject.");
    }

    return updatedSubject;
  }

  // Delete subject
  async deleteSubject(id: string) {
    const existingSubject = await this.subjectRepo.findById(id);

    if (!existingSubject) {
      throw new Error("Subject not found.");
    }

    const deletedSubject = await this.subjectRepo.delete(id);

    if (!deletedSubject) {
      throw new Error("Failed to delete subject.");
    }

    return deletedSubject;
  }
}
