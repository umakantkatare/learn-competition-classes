import "server-only";

import { db } from "@/db";
import { enrollment } from "@/db/schema/academic-schema";

import { and, desc, eq } from "drizzle-orm";

// ---------------------------------------------
// Types
// ---------------------------------------------

export type Enrollment = typeof enrollment.$inferSelect;

export type NewEnrollment = typeof enrollment.$inferInsert;

export type UpdateEnrollment = Partial<Omit<NewEnrollment, "id">>;

// ---------------------------------------------
// Enrollment Repository
// ---------------------------------------------

export class EnrollmentRepository {
  // ---------------------------------------------
  // Create Enrollment
  // ---------------------------------------------

  async create(data: NewEnrollment): Promise<Enrollment> {
    const [result] = await db.insert(enrollment).values(data).returning();

    if (!result) {
      throw new Error("Failed to create enrollment.");
    }

    return result;
  }

  // ---------------------------------------------
  // Find Enrollment By ID
  // ---------------------------------------------

  async findById(id: string): Promise<Enrollment | undefined> {
    const [result] = await db
      .select()
      .from(enrollment)
      .where(eq(enrollment.id, id))
      .limit(1);

    return result;
  }

  // ---------------------------------------------
  // Get All User Enrollments
  // ---------------------------------------------

  async findUserEnrollments(userId: string): Promise<Enrollment[]> {
    return db
      .select()
      .from(enrollment)
      .where(eq(enrollment.userId, userId))
      .orderBy(desc(enrollment.createdAt));
  }

  // ---------------------------------------------
  // Check Enrollment By User And Batch
  // ---------------------------------------------

  async checkEnrollment(
    userId: string,
    batchId: string,
  ): Promise<Enrollment | undefined> {
    const [result] = await db
      .select()
      .from(enrollment)
      .where(
        and(eq(enrollment.userId, userId), eq(enrollment.batchId, batchId)),
      )
      .orderBy(desc(enrollment.createdAt))
      .limit(1);

    return result;
  }

  // ---------------------------------------------
  // Find Active Enrollment
  // ---------------------------------------------

  async findActiveEnrollment(
    userId: string,
    batchId: string,
  ): Promise<Enrollment | undefined> {
    const [result] = await db
      .select()
      .from(enrollment)
      .where(
        and(
          eq(enrollment.userId, userId),
          eq(enrollment.batchId, batchId),
          eq(enrollment.status, "ACTIVE"),
        ),
      )
      .orderBy(desc(enrollment.createdAt))
      .limit(1);

    return result;
  }

  // ---------------------------------------------
  // Update Enrollment
  // ---------------------------------------------

  async update(
    id: string,
    data: UpdateEnrollment,
  ): Promise<Enrollment | undefined> {
    this.validateUpdateData(data);

    const [result] = await db
      .update(enrollment)
      .set(data)
      .where(eq(enrollment.id, id))
      .returning();

    return result;
  }

  // ---------------------------------------------
  // Update Validation
  // ---------------------------------------------

  private validateUpdateData(data: UpdateEnrollment): void {
    if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update an enrollment.",
      );
    }
  }
}
