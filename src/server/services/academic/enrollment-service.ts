import {
  EnrollmentRepository,
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
    private readonly enrollmentRepo: EnrollmentRepository = new EnrollmentRepository(),
    private readonly batchRepo: BatchRepository = new BatchRepository(),
  ) {}

  // 1. Common validation helpers

  private validateId(value: string, fieldName: string): string {
    if (typeof value !== "string") {
      throw new EnrollmentError(`${fieldName} must be a string.`, 400);
    }

    const id = value.trim();

    if (id.length === 0 || id.length > EnrollmentService.MAX_ID_LENGTH) {
      throw new EnrollmentError(
        `${fieldName} is required and must be valid.`,
        400,
      );
    }

    return id;
  }

  private validateDate(value: unknown, fieldName: string): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new EnrollmentError(`${fieldName} must be a valid Date.`, 400);
    }

    return value;
  }

  private validatePositiveInteger(
    value: number,
    fieldName: string,
    max?: number,
  ): number {
    if (
      !Number.isInteger(value) ||
      value < 1 ||
      (max !== undefined && value > max)
    ) {
      const message =
        max === undefined
          ? `${fieldName} must be a positive integer.`
          : `${fieldName} must be between 1 and ${max}.`;

      throw new EnrollmentError(message, 400);
    }

    return value;
  }

  // 2. Expiry date calculation

  private addMonths(date: Date, months: number): Date {
    this.validateDate(date, "Start date");

    this.validatePositiveInteger(months, "Months");

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
    validityMonths: number | null,
  ): Date | null {
    this.validateDate(startDate, "Start date");

    if (validityMonths === null) {
      return null;
    }

    this.validatePositiveInteger(validityMonths, "Batch validity");

    return this.addMonths(startDate, validityMonths);
  }

  private isExpired(
    enrollment: { expiresAt: Date | null },
    now: Date = new Date(),
  ): boolean {
    if (enrollment.expiresAt === null) {
      return false;
    }

    this.validateDate(enrollment.expiresAt, "Enrollment expiry");

    return enrollment.expiresAt.getTime() <= now.getTime();
  }

  // 3. Enroll a student

  async enrollStudent(userId: string, batchId: string, orderId?: string) {
    const validUserId = this.validateId(userId, "User ID");

    const validBatchId = this.validateId(batchId, "Batch ID");

    const validOrderId =
      orderId === undefined ? undefined : this.validateId(orderId, "Order ID");

    const batch = await this.batchRepo.findById(validBatchId);

    if (!batch) {
      throw new EnrollmentError("Batch does not exist.", 404);
    }

    const existingEnrollment = await this.enrollmentRepo.checkEnrollment(
      validUserId,
      validBatchId,
    );

    const now = new Date();

    if (existingEnrollment) {
      if (existingEnrollment.status === "REFUNDED") {
        throw new EnrollmentError(
          "Re-enrollment after a refund requires an explicit policy.",
          409,
        );
      }

      if (existingEnrollment.status === "ACTIVE") {
        if (!this.isExpired(existingEnrollment, now)) {
          throw new EnrollmentError(
            "Student is already actively enrolled in this batch.",
            409,
          );
        }
      } else if (existingEnrollment.status !== "EXPIRED") {
        throw new EnrollmentError(
          "Enrollment cannot be reactivated from its current status.",
          409,
        );
      }

      const expiresAt = this.calculateExpiryDate(now, batch.validityMonths);

      const updated = await this.enrollmentRepo.update(existingEnrollment.id, {
        status: "ACTIVE",
        expiresAt,
        ...(validOrderId !== undefined ? { orderId: validOrderId } : {}),
      });

      if (!updated) {
        throw new EnrollmentError("Failed to reactivate enrollment.", 500);
      }

      return updated;
    }

    const expiresAt = this.calculateExpiryDate(now, batch.validityMonths);

    const enrollmentData: NewEnrollment = {
      userId: validUserId,
      batchId: validBatchId,
      ...(validOrderId !== undefined ? { orderId: validOrderId } : {}),
      status: "ACTIVE",
      expiresAt,
    };

    return this.enrollmentRepo.create(enrollmentData);
  }

  // 4. Check student access

  async hasValidAccess(userId: string, batchId: string): Promise<boolean> {
    const validUserId = this.validateId(userId, "User ID");

    const validBatchId = this.validateId(batchId, "Batch ID");

    const enrollment = await this.enrollmentRepo.checkEnrollment(
      validUserId,
      validBatchId,
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return false;
    }

    return !this.isExpired(enrollment);
  }

  // 5. Get all enrollments for a student

  async getUserEnrollments(userId: string) {
    const validUserId = this.validateId(userId, "User ID");

    return this.enrollmentRepo.findUserEnrollments(validUserId);
  }

  // 6. Revoke enrollment

  async revokeEnrollment(enrollmentId: string) {
    const validEnrollmentId = this.validateId(enrollmentId, "Enrollment ID");

    const enrollment = await this.enrollmentRepo.findById(validEnrollmentId);

    if (!enrollment) {
      throw new EnrollmentError("Enrollment record not found.", 404);
    }

    if (enrollment.status === "REFUNDED") {
      throw new EnrollmentError(
        "A refunded enrollment cannot be revoked.",
        409,
      );
    }

    if (enrollment.status === "EXPIRED") {
      return enrollment;
    }

    const updated = await this.enrollmentRepo.update(validEnrollmentId, {
      status: "EXPIRED",
    });

    if (!updated) {
      throw new EnrollmentError("Failed to revoke enrollment.", 500);
    }

    return updated;
  }

  // 7. Extend enrollment validity

  async extendValidity(enrollmentId: string, extraMonths: number) {
    const validEnrollmentId = this.validateId(enrollmentId, "Enrollment ID");

    this.validatePositiveInteger(
      extraMonths,
      "Extension",
      EnrollmentService.MAX_EXTENSION_MONTHS,
    );

    const enrollment = await this.enrollmentRepo.findById(validEnrollmentId);

    if (!enrollment) {
      throw new EnrollmentError("Enrollment record not found.", 404);
    }

    if (enrollment.status === "REFUNDED") {
      throw new EnrollmentError("Cannot extend a refunded enrollment.", 409);
    }

    const now = new Date();

    const currentExpiry =
      enrollment.expiresAt !== null && !this.isExpired(enrollment, now)
        ? enrollment.expiresAt
        : now;

    const expiresAt = this.addMonths(currentExpiry, extraMonths);

    const updated = await this.enrollmentRepo.update(validEnrollmentId, {
      expiresAt,
      status: "ACTIVE",
    });

    if (!updated) {
      throw new EnrollmentError("Failed to extend enrollment validity.", 500);
    }

    return updated;
  }

  // 8. Update expiry date only

  async updateEnrollment(enrollmentId: string, input: EnrollmentExpiryUpdate) {
    const validEnrollmentId = this.validateId(enrollmentId, "Enrollment ID");

    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new EnrollmentError("A valid update payload is required.", 400);
    }

    const keys = Object.keys(input);

    if (keys.length === 0 || keys.some((key) => key !== "expiresAt")) {
      throw new EnrollmentError(
        "Only the enrollment expiry date can be updated.",
        400,
      );
    }

    if (input.expiresAt !== undefined) {
      if (input.expiresAt !== null) {
        this.validateDate(input.expiresAt, "Expiry date");
      }
    }

    const enrollment = await this.enrollmentRepo.findById(validEnrollmentId);

    if (!enrollment) {
      throw new EnrollmentError("Enrollment record not found.", 404);
    }

    if (enrollment.status === "REFUNDED") {
      throw new EnrollmentError(
        "A refunded enrollment cannot be updated.",
        409,
      );
    }

    const updated = await this.enrollmentRepo.update(validEnrollmentId, input);

    if (!updated) {
      throw new EnrollmentError("Failed to update enrollment.", 500);
    }

    return updated;
  }
}
