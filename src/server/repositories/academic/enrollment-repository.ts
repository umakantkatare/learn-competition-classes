import { db } from "@/db";
import { enrollment } from "@/db/schema/academic-schema";
import { and, desc, eq } from "drizzle-orm";

export type Enrollment = typeof enrollment.$inferSelect;
export type NewEnrollment = typeof enrollment.$inferInsert;

export type UpdateEnrollment = Partial<Omit<NewEnrollment, "id">>;

export class EnrollmentRepository {
  // Create enrollment
  async create(data: NewEnrollment): Promise<Enrollment> {
    const [result] = await db.insert(enrollment).values(data).returning();

    if (!result) {
      throw new Error("Failed to create enrollment");
    }

    return result;
  }

  // Find enrollment by ID
  async findById(id: string): Promise<Enrollment | undefined> {
    const [result] = await db
      .select()
      .from(enrollment)
      .where(eq(enrollment.id, id))
      .limit(1);

    return result;
  }

  // Get all enrollments for a user, newest first
  async findUserEnrollments(userId: string): Promise<Enrollment[]> {
    return db
      .select()
      .from(enrollment)
      .where(eq(enrollment.userId, userId))
      .orderBy(desc(enrollment.createdAt));
  }

  // Find enrollment for a specific user and batch
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
      .limit(1);

    return result;
  }

  // Find active enrollment for a user and batch
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
      .limit(1);

    return result;
  }

  // Update enrollment
  async update(
    id: string,
    data: UpdateEnrollment,
  ): Promise<Enrollment | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update an enrollment");
    }

    const [result] = await db
      .update(enrollment)
      .set(data)
      .where(eq(enrollment.id, id))
      .returning();

    return result;
  }
}
