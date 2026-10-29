import "server-only";

import {
  EnrollmentRepository,
  type Enrollment,
  type NewEnrollment,
} from "@/server/repositories/academic/enrollment-repository";

import { BatchRepository } from "@/server/repositories/academic/batch-repository";

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

export class EnrollmentService {
  private static readonly MAX_EXTENSION_MONTHS = 24;
  private static readonly MAX_ID_LENGTH = 128;

  constructor(
    private readonly enrollmentRepo = new EnrollmentRepository(),
    private readonly batchRepo = new BatchRepository(),
  ) {}

  // ─────────────────────────────────────────────
  // Validation helpers
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Expiry helpers
  // ─────────────────────────────────────────────

  /**
   * Add calendar months without allowing JavaScript's
   * date overflow to move into an unexpected month.
   *
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

  private calculateExpiryDate(
    startDate: Date,
    validityMonths: number,
  ): Date | null {
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

  // ─────────────────────────────────────────────
  // Create / Reactivate enrollment
  // ─────────────────────────────────────────────

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

    const existing = await this.enrollmentRepo.checkEnrollment(userId, batchId);

    const now = new Date();
    const expiresAt = this.calculateExpiryDate(now, batch.validityMonths!);

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

    const enrollmentData: NewEnrollment = {
      userId,
      batchId,
      orderId: orderId ?? null,
      status: "ACTIVE",
      expiresAt,
    };

    return this.enrollmentRepo.create(enrollmentData);
  }

  // ─────────────────────────────────────────────
  // Access validation
  // ─────────────────────────────────────────────

  async hasValidAccess(userId: string, batchId: string): Promise<boolean> {
    this.validateId(userId, "user ID");
    this.validateId(batchId, "batch ID");

    const record = await this.enrollmentRepo.checkEnrollment(userId, batchId);

    if (!record || record.status !== "ACTIVE") {
      return false;
    }

    return !this.isExpired(record.expiresAt);
  }

  // ─────────────────────────────────────────────
  // Read operations
  // ─────────────────────────────────────────────

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    this.validateId(userId, "user ID");

    return this.enrollmentRepo.findUserEnrollments(userId);
  }

  // ─────────────────────────────────────────────
  // Revoke enrollment
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Extend enrollment validity
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Restricted enrollment update
  // ─────────────────────────────────────────────

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
