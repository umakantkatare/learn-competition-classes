import "server-only";

import { db } from "@/db";
import { batch, enrollment } from "@/db/schema/academic-schema";

import { and, desc, eq } from "drizzle-orm";

// ---------------------------------------------
// Types
// ---------------------------------------------

export type Enrollment = typeof enrollment.$inferSelect;

type EnrollmentInsert = typeof enrollment.$inferInsert;

export type CreateEnrollmentData = Pick<
  EnrollmentInsert,
  "userId" | "batchId" | "orderId" | "expiresAt"
>;

export type UpdateEnrollment = Partial<
  Pick<Enrollment, "status" | "expiresAt">
>;

// Transaction executor
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DbExecutor = typeof db | DbTransaction;

// ---------------------------------------------
// Enrollment Repository
// ---------------------------------------------

export class EnrollmentRepository {
  // ---------------------------------------------
  // Create Enrollment
  // ---------------------------------------------

  async create(data: CreateEnrollmentData): Promise<Enrollment> {
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
  // Get User Active Enrollments With Batch
  // ---------------------------------------------

  async findUserEnrollmentsWithBatch(
    userId: string,
    executor: DbExecutor = db,
  ) {
    return executor
      .select({
        enrollment,
        batch,
      })
      .from(enrollment)
      .innerJoin(batch, eq(enrollment.batchId, batch.id))
      .where(
        and(eq(enrollment.userId, userId), eq(enrollment.status, "ACTIVE")),
      )
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
      );

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
    const hasValidField = Object.values(data).some(
      (value) => value !== undefined,
    );

    if (!hasValidField) {
      throw new Error(
        "At least one field is required to update an enrollment.",
      );
    }
  }
}
