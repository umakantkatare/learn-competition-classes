import {
  ExaminationRepository,
  NewExamination,
  UpdateExamination,
} from "../../repositories/academic/examination-repository";

import { ExamCategoryRepository } from "../../repositories/academic/exam-category-repository";

export class ExaminationService {
  private readonly examinationRepo: ExaminationRepository;
  private readonly categoryRepo: ExamCategoryRepository;

  constructor() {
    this.examinationRepo = new ExaminationRepository();
    this.categoryRepo = new ExamCategoryRepository();
  }

  // Create examination
  async createExamination(data: NewExamination) {
    const category = await this.categoryRepo.findById(data.categoryId);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    if (!category.isActive) {
      throw new Error(
        "Cannot create an examination under an inactive category.",
      );
    }

    const existingExam = await this.examinationRepo.findBySlug(data.slug);

    if (existingExam) {
      throw new Error("An examination with this slug already exists.");
    }

    return this.examinationRepo.create(data);
  }

  // Get examination by ID
  async getExaminationById(id: string) {
    const examination = await this.examinationRepo.findById(id);

    if (!examination) {
      throw new Error("Examination not found.");
    }

    return examination;
  }

  // Get examination by slug
  async getExaminationBySlug(slug: string) {
    const examination = await this.examinationRepo.findBySlug(slug);

    if (!examination) {
      throw new Error("Examination not found.");
    }

    return examination;
  }

  // Get examinations by category
  async getExaminationsByCategory(categoryId: string) {
    const category = await this.categoryRepo.findById(categoryId);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    return this.examinationRepo.findByCategory(categoryId);
  }

  // Update examination
  async updateExamination(id: string, data: UpdateExamination) {
    const currentExam = await this.examinationRepo.findById(id);

    if (!currentExam) {
      throw new Error("Examination not found.");
    }

    if (data.categoryId && data.categoryId !== currentExam.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);

      if (!category) {
        throw new Error("The specified exam category does not exist.");
      }

      if (!category.isActive) {
        throw new Error("Cannot assign an inactive exam category.");
      }
    }

    if (data.slug && data.slug !== currentExam.slug) {
      const existingExam = await this.examinationRepo.findBySlug(data.slug);

      if (existingExam && existingExam.id !== id) {
        throw new Error("Another examination is already using this slug.");
      }
    }

    const updatedExam = await this.examinationRepo.update(id, data);

    if (!updatedExam) {
      throw new Error("Failed to update examination.");
    }

    return updatedExam;
  }

  // Deactivate examination instead of permanently deleting it
  async deactivateExamination(id: string) {
    const examination = await this.examinationRepo.findById(id);

    if (!examination) {
      throw new Error("Examination not found.");
    }

    if (!examination.isActive) {
      return examination;
    }

    const result = await this.examinationRepo.deactivate(id);

    if (!result) {
      throw new Error("Failed to deactivate examination.");
    }

    return result;
  }
}
