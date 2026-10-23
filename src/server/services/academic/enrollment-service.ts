import {
  EnrollmentRepository,
  NewEnrollment,
} from "@/server/repositories/academic/enrollment-repository";
import { BatchRepository } from "@/server/repositories/academic/batch-repository";

export class EnrollmentService {
  private readonly enrollmentRepo: EnrollmentRepository;
  private readonly batchRepo: BatchRepository;

  constructor() {
    this.enrollmentRepo = new EnrollmentRepository();
    this.batchRepo = new BatchRepository();
  }

  // Add months without overflowing month-end dates.
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
    validityMonths: number | null,
  ): Date | null {
    if (validityMonths == null || validityMonths <= 0) {
      return null;
    }

    return this.addMonths(startDate, validityMonths);
  }

  // 1. Enroll a student
  async enrollStudent(userId: string, batchId: string, orderId?: string) {
    if (!userId || !batchId) {
      throw new Error("User ID and batch ID are required.");
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch does not exist.");
    }

    const existingEnrollment = await this.enrollmentRepo.checkEnrollment(
      userId,
      batchId,
    );

    if (existingEnrollment?.status === "ACTIVE") {
      if (
        existingEnrollment.expiresAt &&
        existingEnrollment.expiresAt.getTime() <= Date.now()
      ) {
        // Continue below and renew the expired enrollment.
      } else {
        throw new Error("Student is already actively enrolled in this batch.");
      }
    }

    if (existingEnrollment?.status === "REFUNDED") {
      throw new Error(
        "This enrollment was refunded. A new enrollment requires an explicit re-enrollment policy.",
      );
    }

    const now = new Date();
    const expiresAt = this.calculateExpiryDate(now, batch.validityMonths);

    // Reactivate an existing expired record instead of inserting
    // a duplicate user-batch enrollment.
    if (existingEnrollment) {
      const updated = await this.enrollmentRepo.update(existingEnrollment.id, {
        status: "ACTIVE",
        expiresAt,
        ...(orderId ? { orderId } : {}),
      });

      if (!updated) {
        throw new Error("Failed to reactivate enrollment.");
      }

      return updated;
    }

    const enrollmentData: NewEnrollment = {
      userId,
      batchId,
      orderId,
      status: "ACTIVE",
      expiresAt,
    };

    return this.enrollmentRepo.create(enrollmentData);
  }

  // 2. Check whether a student has access
  async hasValidAccess(userId: string, batchId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepo.checkEnrollment(
      userId,
      batchId,
    );

    if (!enrollment || enrollment.status !== "ACTIVE") {
      return false;
    }

    if (enrollment.expiresAt && enrollment.expiresAt.getTime() <= Date.now()) {
      return false;
    }

    return true;
  }

  // 3. Get all enrollments for a student
  async getUserEnrollments(userId: string) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return this.enrollmentRepo.findUserEnrollments(userId);
  }

  // 4. Remove access by marking the enrollment EXPIRED.
  // This is not a true revocation audit record.
  async revokeEnrollment(enrollmentId: string) {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment record not found.");
    }

    if (enrollment.status === "REFUNDED") {
      throw new Error("A refunded enrollment cannot be revoked.");
    }

    if (enrollment.status === "EXPIRED") {
      return enrollment;
    }

    const updated = await this.enrollmentRepo.update(enrollmentId, {
      status: "EXPIRED",
    });

    if (!updated) {
      throw new Error("Failed to update enrollment.");
    }

    return updated;
  }

  // 5. Extend enrollment validity
  async extendValidity(enrollmentId: string, extraMonths: number) {
    if (!Number.isInteger(extraMonths) || extraMonths <= 0) {
      throw new Error("Extra months must be a positive integer.");
    }

    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment record not found.");
    }

    if (enrollment.status === "REFUNDED") {
      throw new Error("Cannot extend a refunded enrollment.");
    }

    const now = new Date();

    // Extend from the existing future expiry date; otherwise
    // extend from now.
    const currentExpiry =
      enrollment.expiresAt && enrollment.expiresAt.getTime() > now.getTime()
        ? new Date(enrollment.expiresAt)
        : now;

    const expiresAt = this.addMonths(currentExpiry, extraMonths);

    const updated = await this.enrollmentRepo.update(enrollmentId, {
      expiresAt,
      status: "ACTIVE",
    });

    if (!updated) {
      throw new Error("Failed to extend enrollment validity.");
    }

    return updated;
  }

  async updateEnrollment(
    enrollmentId: string,
    data: {
      status?: "ACTIVE" | "EXPIRED" | "REFUNDED";
      expiresAt?: Date | null;
      orderId?: string | null;
    },
  ) {
    if (!enrollmentId?.trim()) {
      throw new Error("Enrollment ID is required.");
    }

    const enrollment = await this.enrollmentRepo.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment record not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update enrollment.");
    }

    // Prevent accidental reactivation of refunded enrollments.
    if (enrollment.status === "REFUNDED" && data.status === "ACTIVE") {
      throw new Error("A refunded enrollment cannot be reactivated.");
    }

    if (
      data.expiresAt !== undefined &&
      data.expiresAt !== null &&
      (!(data.expiresAt instanceof Date) ||
        Number.isNaN(data.expiresAt.getTime()))
    ) {
      throw new Error("Invalid enrollment expiry date.");
    }

    const updated = await this.enrollmentRepo.update(enrollmentId, data);

    if (!updated) {
      throw new Error("Failed to update enrollment.");
    }

    return updated;
  }
}
