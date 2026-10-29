import "server-only";

import { db } from "@/db";
import { enrollment } from "@/db/schema/academic-schema";
import { and, desc, eq } from "drizzle-orm";

export type Enrollment = typeof enrollment.$inferSelect;
export type NewEnrollment = typeof enrollment.$inferInsert;

export type UpdateEnrollment = Partial<Omit<NewEnrollment, "id">>;

export class EnrollmentRepository {
  async create(data: NewEnrollment): Promise<Enrollment> {
    const [result] = await db.insert(enrollment).values(data).returning();

    if (!result) {
      throw new Error("Failed to create enrollment.");
    }

    return result;
  }

  async findById(id: string): Promise<Enrollment | undefined> {
    const [result] = await db
      .select()
      .from(enrollment)
      .where(eq(enrollment.id, id))
      .limit(1);

    return result;
  }

  async findUserEnrollments(userId: string): Promise<Enrollment[]> {
    return db
      .select()
      .from(enrollment)
      .where(eq(enrollment.userId, userId))
      .orderBy(desc(enrollment.createdAt));
  }

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

  private validateUpdateData(data: UpdateEnrollment): void {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update an enrollment.",
      );
    }
  }
}
