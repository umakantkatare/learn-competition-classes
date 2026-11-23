import "server-only";

import {
  EnrollmentRepository,
  type Enrollment,
  type NewEnrollment,
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

type EnrollmentExpiryUpdate = Pick<Partial<NewEnrollment>, "expiresAt">;

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

  private validateId(value: string, fieldName: string): void {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.length > EnrollmentService.MAX_ID_LENGTH
    ) {
      throw new EnrollmentError(`Invalid ${fieldName}.`, 400);
    }
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
   * Add calendar months without JavaScript date overflow.
   * Example: January 31 + 1 month = February 28/29.
   */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    const originalDay = result.getDate();

    result.setDate(1);
    result.setMonth(result.getMonth() + months);

    const lastDayOfTargetMonth = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0,
    ).getDate();

    result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

    return result;
  }

  /**
   * Exactly one batch expiry configuration must exist:
   *
   * 1. expiryDate -> Fixed batch expiry.
   * 2. validityMonths -> Enrollment-based expiry.
   */
  private calculateExpiryDate(
    startDate: Date,
    validityMonths: number | null,
    batchExpiryDate: Date | null,
  ): Date | null {
    this.validateDate(startDate, "Enrollment start date");
    this.validateDate(batchExpiryDate, "Batch expiry date");

    const hasValidity = validityMonths !== null;
    const hasFixedExpiry = batchExpiryDate !== null;

    // Both configured or both missing
    if (hasValidity === hasFixedExpiry) {
      throw new EnrollmentError(
        "Batch must have either validity months or a fixed expiry date.",
        400,
      );
    }

    // Fixed batch expiry date
    if (batchExpiryDate) {
      const expiryDate = new Date(batchExpiryDate);

      if (expiryDate.getTime() <= startDate.getTime()) {
        throw new EnrollmentError("This batch has already expired.", 400);
      }

      return expiryDate;
    }

    // Validity-based expiry
    if (validityMonths === null) {
      throw new EnrollmentError("Batch expiry configuration is missing.", 400);
    }

    // Zero means unlimited validity
    if (validityMonths === 0) {
      return null;
    }

    this.validatePositiveInteger(validityMonths, "Batch validity");

    const expiryDate = this.addMonths(startDate, validityMonths);

    if (Number.isNaN(expiryDate.getTime())) {
      throw new EnrollmentError("Failed to calculate enrollment expiry.", 500);
    }

    return expiryDate;
  }

  private isExpired(expiresAt: Date | null, now = new Date()): boolean {
    return expiresAt !== null && expiresAt.getTime() <= now.getTime();
  }

  private assertEnrollmentCanBeModified(enrollmentRecord: Enrollment): void {
    if (enrollmentRecord.status === "REFUNDED") {
      throw new EnrollmentError("Refunded enrollment cannot be modified.", 409);
    }
  }

  private async requireEnrollment(enrollmentId: string): Promise<Enrollment> {
    this.validateId(enrollmentId, "enrollment ID");

    const record = await this.enrollmentRepo.findById(enrollmentId);

    if (!record) {
      throw new EnrollmentError("Enrollment not found.", 404);
    }

    return record;
  }

  // ---------------------------------------------
  // Create / Reactivate Enrollment
  // ---------------------------------------------

  async enrollStudent(
    userId: string,
    batchId: string,
    orderId?: string,
  ): Promise<Enrollment> {
    this.validateId(userId, "user ID");
    this.validateId(batchId, "batch ID");

    if (orderId !== undefined) {
      this.validateId(orderId, "order ID");
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new EnrollmentError("Batch not found.", 404);
    }

    const now = new Date();

    // Calculate expiry using either batch expiryDate
    // or validityMonths.
    const expiresAt = this.calculateExpiryDate(
      now,
      batch.validityMonths ?? null,
      batch.expiryDate ?? null,
    );

    const existing = await this.enrollmentRepo.checkEnrollment(userId, batchId);

    // Existing enrollment
    if (existing) {
      this.assertEnrollmentCanBeModified(existing);

      const isActiveAndValid =
        existing.status === "ACTIVE" &&
        !this.isExpired(existing.expiresAt, now);

      if (isActiveAndValid) {
        throw new EnrollmentError(
          "Student is already enrolled in this batch.",
          409,
        );
      }

      if (existing.status !== "EXPIRED") {
        throw new EnrollmentError(
          "Enrollment cannot be reactivated in its current state.",
          409,
        );
      }

      const updateData: Partial<NewEnrollment> = {
        status: "ACTIVE",
        expiresAt,
      };

      if (orderId !== undefined) {
        updateData.orderId = orderId;
      }

      const updated = await this.enrollmentRepo.update(existing.id, updateData);

      if (!updated) {
        throw new EnrollmentError("Failed to reactivate enrollment.", 500);
      }

      return updated;
    }

    // New enrollment
    const enrollmentData: NewEnrollment = {
      userId,
      batchId,
      orderId: orderId ?? null,
      status: "ACTIVE",
      expiresAt,
    };

    return this.enrollmentRepo.create(enrollmentData);
  }

  // ---------------------------------------------
  // Access Validation
  // ---------------------------------------------

  async hasValidAccess(userId: string, batchId: string): Promise<boolean> {
    this.validateId(userId, "user ID");
    this.validateId(batchId, "batch ID");

    const record = await this.enrollmentRepo.checkEnrollment(userId, batchId);

    if (!record || record.status !== "ACTIVE") {
      return false;
    }

    return !this.isExpired(record.expiresAt);
  }

  // ---------------------------------------------
  // Read Operations
  // ---------------------------------------------

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    this.validateId(userId, "user ID");

    return this.enrollmentRepo.findUserEnrollments(userId);
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

    if (keys.length === 0) {
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

    this.validateDate(input.expiresAt, "expiry date");

    const updated = await this.enrollmentRepo.update(record.id, input);

    if (!updated) {
      throw new EnrollmentError("Failed to update enrollment.", 500);
    }

    return updated;
  }
}
