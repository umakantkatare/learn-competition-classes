import { db } from "@/db";

import {
  BatchRepository,
  type Batch,
  type UpdateBatch,
} from "@/server/repositories/academic/batch-repository";

import { ExaminationRepository } from "@/server/repositories/academic/examination-repository";
import { BatchTeacherRepository } from "@/server/repositories/academic/batch-teacher-repository";
import { TeacherRepository } from "@/server/repositories/academic/teacher-repository";

import type {
  CreateBatchInput,
  UpdateBatchInput,
} from "@/validations/academic/batch-validation";

type BatchStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

interface BatchStatusUpdateStats {
  date: string;
  totalProcessed: number;
  upcomingToOngoing: number;
  ongoingToCompleted: number;
  upcomingToCompleted: number;
  unchanged: number;
}

export class BatchService {
  private readonly batchRepo: BatchRepository;
  private readonly examinationRepo: ExaminationRepository;
  private readonly batchTeacherRepo: BatchTeacherRepository;
  private readonly teacherRepo: TeacherRepository;

  constructor() {
    this.batchRepo = new BatchRepository();
    this.examinationRepo = new ExaminationRepository();
    this.batchTeacherRepo = new BatchTeacherRepository();
    this.teacherRepo = new TeacherRepository();
  }

  private async validateTeachers(teacherIds: string[]): Promise<void> {
    if (teacherIds.length === 0) return;

    const teacherProfiles = await Promise.all(
      teacherIds.map((id) => this.teacherRepo.findById(id)),
    );

    if (teacherProfiles.some((teacher) => !teacher)) {
      throw new Error("One or more teacher profiles were not found.");
    }
  }

  private getIndiaDateKey(value: Date | string): string {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid batch date.");
    }

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  private validateStartDate(startDate: Date | string): void {
    const today = this.getIndiaDateKey(new Date());
    const selectedDate = this.getIndiaDateKey(startDate);

    if (selectedDate < today) {
      throw new Error("Batch start date cannot be earlier than today's date.");
    }
  }

  private validatePricing(
    isFree: boolean,
    originalPrice: number,
    discountPrice: number,
  ): void {
    if (
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(discountPrice) ||
      originalPrice < 0 ||
      discountPrice < 0
    ) {
      throw new Error("Batch prices must be valid non-negative numbers.");
    }

    if (isFree && (originalPrice !== 0 || discountPrice !== 0)) {
      throw new Error(
        "Free batches must have zero original and discount prices.",
      );
    }

    if (!isFree && discountPrice > originalPrice) {
      throw new Error(
        "Discount price cannot be greater than the original price.",
      );
    }
  }

  private validateSchedule(
    expiryDate: Date | null,
    validityMonths: number | null,
  ): void {
    const hasExpiryDate = expiryDate !== null;
    const hasValidityMonths = validityMonths !== null;

    if (hasExpiryDate === hasValidityMonths) {
      throw new Error(
        "Provide either expiry date or validity months, not both.",
      );
    }

    if (
      validityMonths !== null &&
      (!Number.isInteger(validityMonths) || validityMonths <= 0)
    ) {
      throw new Error("Validity months must be a positive integer.");
    }
  }

  private validateExpiryDate(startDate: Date, expiryDate: Date | null): void {
    if (expiryDate && expiryDate <= startDate) {
      throw new Error("Expiry date must be after the start date.");
    }
  }

  private calculateExpiryDate(
    startDate: Date | string,
    validityMonths: number,
  ): string {
    const dateKey = this.getIndiaDateKey(startDate);

    const [year, month, day] = dateKey.split("-").map(Number);

    const targetMonth = month - 1 + validityMonths;
    const targetYear = year + Math.floor(targetMonth / 12);
    const normalizedMonth = targetMonth % 12;

    const lastDay = new Date(
      Date.UTC(targetYear, normalizedMonth + 1, 0),
    ).getUTCDate();

    const expiryDay = Math.min(day, lastDay);

    return [
      targetYear,
      String(normalizedMonth + 1).padStart(2, "0"),
      String(expiryDay).padStart(2, "0"),
    ].join("-");
  }

  private calculateBatchStatus(
    startDate: Date | string,
    expiryDate: Date | string | null,
    validityMonths: number | null,
    today: string,
  ): BatchStatus {
    const startDateKey = this.getIndiaDateKey(startDate);

    const expiryDateKey = expiryDate
      ? this.getIndiaDateKey(expiryDate)
      : validityMonths !== null
        ? this.calculateExpiryDate(startDate, validityMonths)
        : null;

    if (!expiryDateKey) {
      throw new Error("Batch expiry date or validity months are required.");
    }

    if (today >= expiryDateKey) {
      return "COMPLETED";
    }

    if (today < startDateKey) {
      return "UPCOMING";
    }

    return "ONGOING";
  }

  private async enrichBatch(batch: Batch) {
    const assignments = await this.batchTeacherRepo.findByBatchId(batch.id);

    const teachers = await Promise.all(
      assignments.map(async (assignment) => {
        const teacher = await this.teacherRepo.findByIdWithUser(
          assignment.teacherId,
        );

        return {
          batchId: assignment.batchId,
          teacherId: assignment.teacherId,
          teacher: teacher ?? null,
        };
      }),
    );

    return {
      ...batch,
      teachers,
    };
  }

  private async enrichBatches(batches: Batch[]) {
    return Promise.all(batches.map((batch) => this.enrichBatch(batch)));
  }

  async createBatch(data: CreateBatchInput, userId: string) {
    const { teacherIds = [], ...batchData } = data;

    // Validate examination
    const examination = await this.examinationRepo.findById(
      batchData.examinationId,
    );

    if (!examination) {
      throw new Error("The specified examination does not exist.");
    }

    if (!examination.isActive) {
      throw new Error("Cannot create a batch for an inactive examination.");
    }

    // Validate start date
    this.validateStartDate(batchData.startDate);

    // Validate unique slug
    const existingBatch = await this.batchRepo.findBySlug(batchData.slug);

    if (existingBatch) {
      throw new Error("A batch with this slug already exists.");
    }

    // Validate pricing
    this.validatePricing(
      batchData.isFree,
      Number(batchData.originalPrice),
      Number(batchData.discountPrice),
    );

    // Validate schedule
    this.validateSchedule(
      batchData.expiryDate ?? null,
      batchData.validityMonths ?? null,
    );

    // Validate expiry date
    this.validateExpiryDate(batchData.startDate, batchData.expiryDate ?? null);

    // Validate teacher profiles
    await this.validateTeachers(teacherIds);

    // Create batch and teacher assignments atomically
    const newBatch = await db.transaction(async (tx) => {
      const createdBatch = await this.batchRepo.create(
        {
          ...batchData,
          features: batchData.features ?? [],
          thumbnail: batchData.thumbnail ?? "",
          thumbnailFileId: batchData.thumbnailFileId ?? null,
          previewVideo: batchData.previewVideo ?? null,
          previewVideoFileId: batchData.previewVideoFileId ?? null,
          createdBy: userId,
        },
        tx,
      );

      // Assign teachers
      if (teacherIds.length > 0) {
        await this.batchTeacherRepo.createMany(
          teacherIds.map((teacherId) => ({
            batchId: createdBatch.id,
            teacherId,
          })),
          tx,
        );
      }

      return createdBatch;
    });

    // Return enriched batch details
    return this.getBatchById(newBatch.id);
  }

  async getAllBatches() {
    const batches = await this.batchRepo.findAll();
    return this.enrichBatches(batches);
  }

  async getAllPublishedBatches() {
    const batches = await this.batchRepo.findAllPublished();
    return this.enrichBatches(batches);
  }

  async getPublishedBatchById(id: string) {
    const batch = await this.batchRepo.findPublishedById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.enrichBatch(batch);
  }

  async getBatchById(id: string) {
    const batch = await this.batchRepo.findById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.enrichBatch(batch);
  }

  async getBatchBySlug(slug: string) {
    const batch = await this.batchRepo.findPublishedBySlug(slug);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.enrichBatch(batch);
  }

  async getBatchesByExamination(examinationId: string) {
    const examination = await this.examinationRepo.findById(examinationId);

    if (!examination) {
      throw new Error("Examination not found.");
    }

    const batches = await this.batchRepo.findByExaminationId(examinationId);

    return this.enrichBatches(batches);
  }

  async updateBatch(id: string, data: UpdateBatchInput) {
    const currentBatch = await this.batchRepo.findById(id);

    if (!currentBatch) {
      throw new Error("Batch not found.");
    }

    const { teacherIds, ...batchData } = data;

    if (
      batchData.examinationId &&
      batchData.examinationId !== currentBatch.examinationId
    ) {
      const examination = await this.examinationRepo.findById(
        batchData.examinationId,
      );

      if (!examination) {
        throw new Error("The specified examination does not exist.");
      }

      if (!examination.isActive) {
        throw new Error("Cannot assign an inactive examination.");
      }
    }

    if (batchData.slug && batchData.slug !== currentBatch.slug) {
      const existingBatch = await this.batchRepo.findBySlug(batchData.slug);

      if (existingBatch && existingBatch.id !== id) {
        throw new Error("Another batch is already using this slug.");
      }
    }

    const finalOriginalPrice = Number(
      batchData.originalPrice ?? currentBatch.originalPrice,
    );

    const finalDiscountPrice = Number(
      batchData.discountPrice ?? currentBatch.discountPrice,
    );

    const finalIsFree = batchData.isFree ?? currentBatch.isFree;

    this.validatePricing(finalIsFree, finalOriginalPrice, finalDiscountPrice);

    // Validate final dates
    const finalStartDate = batchData.startDate ?? currentBatch.startDate;

    this.validateStartDate(finalStartDate);

    // Resolve final schedule using existing database values
    let finalExpiryDate: Date | null = currentBatch.expiryDate;
    let finalValidityMonths: number | null = currentBatch.validityMonths;

    // If a new expiry date is provided, clear validity
    if (batchData.expiryDate !== undefined && batchData.expiryDate !== null) {
      finalExpiryDate = batchData.expiryDate;
      finalValidityMonths = null;
    }

    // If a new validity is provided, clear expiry date
    if (
      batchData.validityMonths !== undefined &&
      batchData.validityMonths !== null
    ) {
      finalValidityMonths = batchData.validityMonths;
      finalExpiryDate = null;
    }

    // Handle explicit null values
    if (
      batchData.expiryDate === null &&
      batchData.validityMonths === undefined
    ) {
      finalExpiryDate = null;
    }

    if (
      batchData.validityMonths === null &&
      batchData.expiryDate === undefined
    ) {
      finalValidityMonths = null;
    }

    // Validate final schedule
    this.validateSchedule(finalExpiryDate, finalValidityMonths);

    // Validate final expiry date
    this.validateExpiryDate(finalStartDate, finalExpiryDate);

    // Validate teachers only when teacherIds are supplied
    if (teacherIds !== undefined) {
      await this.validateTeachers(teacherIds);
    }

    // Update batch and synchronize assignments atomically
    await db.transaction(async (tx) => {
      // Update batch fields only when provided
      if (Object.keys(batchData).length > 0) {
        const result = await this.batchRepo.update(
          id,
          batchData as UpdateBatch,
          tx,
        );

        if (!result) {
          throw new Error("Failed to update batch.");
        }
      }

      // Sync teachers only when teacherIds is provided
      if (teacherIds !== undefined) {
        await this.batchTeacherRepo.deleteByBatchId(id, tx);

        if (teacherIds.length > 0) {
          await this.batchTeacherRepo.createMany(
            teacherIds.map((teacherId) => ({
              batchId: id,
              teacherId,
            })),
            tx,
          );
        }
      }
    });

    return this.getBatchById(id);
  }

  // Update Batch Statuses (Cron Job)

  async updateBatchStatuses(): Promise<BatchStatusUpdateStats> {
    const today = this.getIndiaDateKey(new Date());

    const stats: BatchStatusUpdateStats = {
      date: today,
      totalProcessed: 0,
      upcomingToOngoing: 0,
      ongoingToCompleted: 0,
      upcomingToCompleted: 0,
      unchanged: 0,
    };

    await db.transaction(async (tx) => {
      // Fetch all batches within the transaction
      const batches = await this.batchRepo.findAll(tx);

      stats.totalProcessed = batches.length;

      for (const batch of batches) {
        const nextStatus = this.calculateBatchStatus(
          batch.startDate,
          batch.expiryDate,
          batch.validityMonths,
          today,
        );

        // Skip unchanged records
        if (batch.status === nextStatus) {
          stats.unchanged++;
          continue;
        }

        const previousStatus = batch.status;

        // Update batch status
        const updated = await this.batchRepo.update(
          batch.id,
          { status: nextStatus },
          tx,
        );

        if (!updated) {
          throw new Error(`Failed to update batch status: ${batch.id}`);
        }

        // Track status transitions
        if (previousStatus === "UPCOMING" && nextStatus === "ONGOING") {
          stats.upcomingToOngoing++;
        } else if (previousStatus === "ONGOING" && nextStatus === "COMPLETED") {
          stats.ongoingToCompleted++;
        } else if (
          previousStatus === "UPCOMING" &&
          nextStatus === "COMPLETED"
        ) {
          stats.upcomingToCompleted++;
        }
      }
    });

    return stats;
  }

  // Publish Batch

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

    const result = await this.batchRepo.publish(id);

    if (!result) {
      throw new Error("Failed to publish batch.");
    }

    return this.enrichBatch(result);
  }

  // Unpublish Batch

  async unpublishBatch(id: string) {
    const batch = await this.batchRepo.findById(id);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    const result = await this.batchRepo.unpublish(id);

    if (!result) {
      throw new Error("Failed to unpublish batch.");
    }

    return this.enrichBatch(result);
  }
}
