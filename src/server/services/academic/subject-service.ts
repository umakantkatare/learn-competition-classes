import {
  SubjectRepository,
  type NewSubject,
  type UpdateSubject,
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
    if (!id?.trim()) {
      throw new Error("Subject ID is required.");
    }

    const existingSubject = await this.subjectRepo.findById(id);

    if (!existingSubject) {
      throw new Error("Subject not found.");
    }

    return existingSubject;
  }

  // Get all subjects
  async getAllSubjects() {
    return this.subjectRepo.findAll();
  }

  // Get subjects by batch ID
  async getSubjectsByBatchId(batchId: string) {
    if (!batchId?.trim()) {
      throw new Error("Batch ID is required.");
    }

    return this.subjectRepo.findByBatchId(batchId);
  }

  // Update subject
  async updateSubject(id: string, data: UpdateSubject) {
    if (!id?.trim()) {
      throw new Error("Subject ID is required.");
    }

    const existingSubject = await this.subjectRepo.findById(id);

    if (!existingSubject) {
      throw new Error("Subject not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a subject.");
    }

    const updateData: UpdateSubject = { ...data };

    // Validate subject name
    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        throw new Error("Subject name cannot be empty.");
      }

      updateData.name = name;
    }

    // Validate batch ID
    if (data.batchId !== undefined && !data.batchId.trim()) {
      throw new Error("Batch ID cannot be empty.");
    }

    const updatedSubject = await this.subjectRepo.update(id, updateData);

    if (!updatedSubject) {
      throw new Error("Failed to update subject.");
    }

    return updatedSubject;
  }

  // Delete subject
  async deleteSubject(id: string) {
    if (!id?.trim()) {
      throw new Error("Subject ID is required.");
    }

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
