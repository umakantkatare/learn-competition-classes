import {
  BatchRepository,
  NewBatch,
  UpdateBatch,
} from "@/server/repositories/academic/batch-repository";

import { ExaminationRepository } from "@/server/repositories/academic/examination-repository";
import { BatchTeacherRepository } from "@/server/repositories/academic/batch-teacher-repository";

export class BatchService {
  private readonly batchRepo: BatchRepository;
  private readonly examinationRepo: ExaminationRepository;
  private readonly batchTeacherRepo: BatchTeacherRepository;

  constructor() {
    this.batchRepo = new BatchRepository();
    this.examinationRepo = new ExaminationRepository();
    this.batchTeacherRepo = new BatchTeacherRepository();
  }

  // Create batch
  async createBatch(data: NewBatch, teacherIds: string[] = []) {
    // Validate examination
    const examination = await this.examinationRepo.findById(data.examinationId);

    if (!examination) {
      throw new Error("The specified examination does not exist.");
    }

    if (!examination.isActive) {
      throw new Error("Cannot create a batch for an inactive examination.");
    }

    // Validate unique slug
    const existingBatch = await this.batchRepo.findBySlug(data.slug);

    if (existingBatch) {
      throw new Error("A batch with this slug already exists.");
    }

    // Validate pricing
    if (Number(data.discountPrice) > Number(data.originalPrice)) {
      throw new Error(
        "Discount price cannot be greater than the original price.",
      );
    }

    if (Number(data.originalPrice) < 0 || Number(data.discountPrice) < 0) {
      throw new Error("Batch prices cannot be negative.");
    }

    // Create batch
    const newBatch = await this.batchRepo.create(data);

    // Assign teachers
    // Note: Validate teacher IDs before inserting assignments.
    if (teacherIds.length > 0) {
      const uniqueTeacherIds = [...new Set(teacherIds)];

      await this.batchTeacherRepo.createMany(
        uniqueTeacherIds.map((teacherId) => ({
          batchId: newBatch.id,
          teacherId,
        })),
      );
    }

    return newBatch;
  }

  // Get batch by ID (admin/internal)
  async getBatchById(id: string) {
    const batch = await this.batchRepo.findById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return batch;
  }

  // Get published batch by slug (public page)
  async getBatchBySlug(slug: string) {
    const batch = await this.batchRepo.findBySlug(slug);

    if (!batch || !batch.isPublished) {
      throw new Error("Batch not found.");
    }

    return batch;
  }

  // Get batches by examination
  async getBatchesByExamination(examinationId: string) {
    const examination = await this.examinationRepo.findById(examinationId);

    if (!examination) {
      throw new Error("Examination not found.");
    }

    return this.batchRepo.findByExaminationId(examinationId);
  }

  // Update batch
  async updateBatch(id: string, data: UpdateBatch) {
    const currentBatch = await this.batchRepo.findById(id);

    if (!currentBatch) {
      throw new Error("Batch not found.");
    }

    // Validate examination if changed
    if (
      data.examinationId &&
      data.examinationId !== currentBatch.examinationId
    ) {
      const examination = await this.examinationRepo.findById(
        data.examinationId,
      );

      if (!examination) {
        throw new Error("The specified examination does not exist.");
      }

      if (!examination.isActive) {
        throw new Error("Cannot assign an inactive examination.");
      }
    }

    // Validate slug if changed
    if (data.slug && data.slug !== currentBatch.slug) {
      const existingBatch = await this.batchRepo.findBySlug(data.slug);

      if (existingBatch && existingBatch.id !== id) {
        throw new Error("Another batch is already using this slug.");
      }
    }

    // Validate final prices, including unchanged values
    const originalPrice = Number(
      data.originalPrice ?? currentBatch.originalPrice,
    );

    const discountPrice = Number(
      data.discountPrice ?? currentBatch.discountPrice,
    );

    if (
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(discountPrice) ||
      originalPrice < 0 ||
      discountPrice < 0
    ) {
      throw new Error("Batch prices must be valid non-negative numbers.");
    }

    if (discountPrice > originalPrice) {
      throw new Error(
        "Discount price cannot be greater than the original price.",
      );
    }

    return this.batchRepo.update(id, data);
  }

  // Publish batch
  async publishBatch(id: string) {
    const batch = await this.batchRepo.findById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    const examination = await this.examinationRepo.findById(
      batch.examinationId,
    );

    if (!examination || !examination.isActive) {
      throw new Error("Cannot publish a batch under an inactive examination.");
    }

    return this.batchRepo.publish(id);
  }

  // Unpublish batch instead of permanently deleting it
  async unpublishBatch(id: string) {
    const batch = await this.batchRepo.findById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.batchRepo.unpublish(id);
  }
}
