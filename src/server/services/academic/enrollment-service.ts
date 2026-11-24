import "server-only";

import {
  EnrollmentRepository,
  type Enrollment,
  type CreateEnrollmentData,
  type UpdateEnrollment,
} from "@/server/repositories/academic/enrollment-repository";

import { BatchRepository } from "@/server/repositories/academic/batch-repository";

// ---------------------------------------------
// Errors
// ---------------------------------------------

export class EnrollmentError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "EnrollmentError";
  }
}

type EnrollmentExpiryUpdate = Pick<UpdateEnrollment, "expiresAt">;

// ---------------------------------------------
// Enrollment Service
// ---------------------------------------------

export class EnrollmentService {
  private static readonly MAX_EXTENSION_MONTHS = 24;
  private static readonly MAX_ID_LENGTH = 128;

  constructor(
    private readonly enrollmentRepo = new EnrollmentRepository(),
    private readonly batchRepo = new BatchRepository(),
  ) {}

  // ---------------------------------------------
  // Validation Helpers
  // ---------------------------------------------

  private validateId(value: string, fieldName: string): string {
    if (typeof value !== "string") {
      throw new EnrollmentError(`Invalid ${fieldName}.`, 400);
    }

    const normalizedValue = value.trim();

    if (
      normalizedValue.length === 0 ||
      normalizedValue.length > EnrollmentService.MAX_ID_LENGTH
    ) {
      throw new EnrollmentError(`Invalid ${fieldName}.`, 400);
    }

    return normalizedValue;
  }

  private validateDate(
    value: Date | null | undefined,
    fieldName: string,
  ): void {
    if (
      value != null &&
      (!(value instanceof Date) || Number.isNaN(value.getTime()))
    ) {
      throw new EnrollmentError(`Invalid ${fieldName}.`, 400);
    }
  }

  private validatePositiveInteger(
    value: number,
    fieldName: string,
    max?: number,
  ): void {
    if (
      !Number.isSafeInteger(value) ||
      value <= 0 ||
      (max !== undefined && value > max)
    ) {
      throw new EnrollmentError(
        max
          ? `${fieldName} must be between 1 and ${max}.`
          : `${fieldName} must be a positive integer.`,
        400,
      );
    }
  }

  // ---------------------------------------------
  // Expiry Helpers
  // ---------------------------------------------

  /**
   * Add calendar months without overflowing the target month.
   * Example: January 31 + 1 month = February 28/29.
   */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const originalDay = result.getUTCDate();

    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);

    const lastDayOfTargetMonth = new Date(
      Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
    ).getUTCDate();

    result.setUTCDate(Math.min(originalDay, lastDayOfTargetMonth));

    return result;
  }

  /**
   * Batch must have exactly one expiry configuration:
   * 1. Fixed expiry date.
   * 2. Enrollment-based validity months.
   */
  private calculateExpiryDate(
    enrolledAt: Date,
    validityMonths: number | null,
    batchExpiryDate: Date | null,
  ): Date {
    this.validateDate(enrolledAt, "Enrollment date");
    this.validateDate(batchExpiryDate, "Batch expiry date");

    const hasValidity = validityMonths !== null;
    const hasFixedExpiry = batchExpiryDate !== null;

    if (hasValidity === hasFixedExpiry) {
      throw new EnrollmentError(
        "Batch must have either validity months or a fixed expiry date.",
        400,
      );
    }

    // Fixed expiry
    if (batchExpiryDate !== null) {
      const expiryDate = new Date(batchExpiryDate);

      if (expiryDate.getTime() <= enrolledAt.getTime()) {
        throw new EnrollmentError("This batch has already expired.", 400);
      }

      return expiryDate;
    }

    // Validity-based expiry
    if (validityMonths === null) {
      throw new EnrollmentError("Batch expiry configuration is missing.", 400);
    }

    this.validatePositiveInteger(validityMonths, "Batch validity");

    return this.addMonths(enrolledAt, validityMonths);
  }

  private isExpired(expiresAt: Date | null, now = new Date()): boolean {
    return expiresAt !== null && expiresAt.getTime() <= now.getTime();
  }

  // ---------------------------------------------
  // Enrollment Helpers
  // ---------------------------------------------

  private assertEnrollmentCanBeModified(enrollmentRecord: Enrollment): void {
    if (enrollmentRecord.status === "REFUNDED") {
      throw new EnrollmentError("Refunded enrollment cannot be modified.", 409);
    }
  }

  private async requireEnrollment(enrollmentId: string): Promise<Enrollment> {
    const id = this.validateId(enrollmentId, "Enrollment ID");

    const record = await this.enrollmentRepo.findById(id);

    if (!record) {
      throw new EnrollmentError("Enrollment not found.", 404);
    }

    return record;
  }

  // ---------------------------------------------
  // Create / Re-enroll Student
  // ---------------------------------------------

  async enrollStudent(
    userId: string,
    batchId: string,
    orderId?: string,
  ): Promise<Enrollment> {
    const normalizedUserId = this.validateId(userId, "User ID");
    const normalizedBatchId = this.validateId(batchId, "Batch ID");

    const normalizedOrderId =
      orderId !== undefined ? this.validateId(orderId, "Order ID") : null;

    const batch = await this.batchRepo.findById(normalizedBatchId);

    if (!batch) {
      throw new EnrollmentError("Batch not found.", 404);
    }

    const now = new Date();

    const expiresAt = this.calculateExpiryDate(
      now,
      batch.validityMonths ?? null,
      batch.expiryDate ?? null,
    );

    const existing = await this.enrollmentRepo.checkEnrollment(
      normalizedUserId,
      normalizedBatchId,
    );

    if (existing) {
      // Already enrolled and access is valid
      if (
        existing.status === "ACTIVE" &&
        !this.isExpired(existing.expiresAt, now)
      ) {
        throw new EnrollmentError(
          "Student is already enrolled in this batch.",
          409,
        );
      }

      // An ACTIVE record whose expiry date has passed
      // must be marked EXPIRED before creating a new record.
      if (existing.status === "ACTIVE") {
        const expired = await this.enrollmentRepo.update(existing.id, {
          status: "EXPIRED",
        });

        if (!expired) {
          throw new EnrollmentError(
            "Failed to expire previous enrollment.",
            500,
          );
        }
      }

      // EXPIRED and REFUNDED records remain in history.
      // A new enrollment record will be created below.
    }

    const enrollmentData: CreateEnrollmentData = {
      userId: normalizedUserId,
      batchId: normalizedBatchId,
      orderId: normalizedOrderId,
      expiresAt,
    };

    return this.enrollmentRepo.create(enrollmentData);
  }

  // ---------------------------------------------
  // Access Validation
  // ---------------------------------------------

  async hasValidAccess(userId: string, batchId: string): Promise<boolean> {
    const normalizedUserId = this.validateId(userId, "User ID");
    const normalizedBatchId = this.validateId(batchId, "Batch ID");

    const record = await this.enrollmentRepo.findActiveEnrollment(
      normalizedUserId,
      normalizedBatchId,
    );

    if (!record) {
      return false;
    }

    return !this.isExpired(record.expiresAt);
  }

  // ---------------------------------------------
  // Read Operations
  // ---------------------------------------------

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    const normalizedUserId = this.validateId(userId, "User ID");

    return this.enrollmentRepo.findUserEnrollments(normalizedUserId);
  }

  // ---------------------------------------------
  // My Batches
  // ---------------------------------------------

  async getUserEnrollmentsWithBatch(userId: string) {
    const normalizedUserId = this.validateId(userId, "User ID");

    return this.enrollmentRepo.findUserEnrollmentsWithBatch(normalizedUserId);
  }

  // ---------------------------------------------
  // Revoke Enrollment
  // ---------------------------------------------

  async revokeEnrollment(enrollmentId: string): Promise<Enrollment> {
    const record = await this.requireEnrollment(enrollmentId);

    this.assertEnrollmentCanBeModified(record);

    if (record.status === "EXPIRED") {
      return record;
    }

    const updated = await this.enrollmentRepo.update(record.id, {
      status: "EXPIRED",
    });

    if (!updated) {
      throw new EnrollmentError("Failed to revoke enrollment.", 500);
    }

    return updated;
  }

  // ---------------------------------------------
  // Extend Enrollment Validity
  // ---------------------------------------------

  async extendValidity(
    enrollmentId: string,
    extraMonths: number,
  ): Promise<Enrollment> {
    this.validatePositiveInteger(
      extraMonths,
      "Extension duration",
      EnrollmentService.MAX_EXTENSION_MONTHS,
    );

    const record = await this.requireEnrollment(enrollmentId);

    this.assertEnrollmentCanBeModified(record);

    const now = new Date();

    const baseDate =
      record.expiresAt && !this.isExpired(record.expiresAt, now)
        ? record.expiresAt
        : now;

    const expiresAt = this.addMonths(baseDate, extraMonths);

    if (Number.isNaN(expiresAt.getTime())) {
      throw new EnrollmentError(
        "Failed to calculate extended expiry date.",
        500,
      );
    }

    const updated = await this.enrollmentRepo.update(record.id, {
      expiresAt,
      status: "ACTIVE",
    });

    if (!updated) {
      throw new EnrollmentError("Failed to extend enrollment validity.", 500);
    }

    return updated;
  }

  // ---------------------------------------------
  // Restricted Enrollment Update
  // ---------------------------------------------

  async updateEnrollment(
    enrollmentId: string,
    input: EnrollmentExpiryUpdate,
  ): Promise<Enrollment> {
    const record = await this.requireEnrollment(enrollmentId);

    this.assertEnrollmentCanBeModified(record);

    const keys = Object.keys(input);

    if (keys.length === 0 || input.expiresAt === undefined) {
      throw new EnrollmentError(
        "At least one field is required to update enrollment.",
        400,
      );
    }

    if (keys.some((key) => key !== "expiresAt")) {
      throw new EnrollmentError(
        "Only expiresAt can be updated through this operation.",
        400,
      );
    }

    this.validateDate(input.expiresAt, "Expiry date");

    const updated = await this.enrollmentRepo.update(record.id, input);

    if (!updated) {
      throw new EnrollmentError("Failed to update enrollment.", 500);
    }

    return updated;
  }
}
