import { db } from "@/db";
import { batch, enrollment } from "@/db/schema/academic-schema";
import { and, asc, countDistinct, eq } from "drizzle-orm";

export class StudentRepository {
  async getTotalStudents(): Promise<number> {
    const [result] = await db
      .select({
        totalStudents: countDistinct(enrollment.userId),
      })
      .from(enrollment)
      .where(eq(enrollment.status, "ACTIVE"));

    return result.totalStudents;
  }

  // Get active student count per batch
  async getStudentsPerBatch() {
    return db
      .select({
        batchId: batch.id,
        batchTitle: batch.title,
        totalStudents: countDistinct(enrollment.userId),
      })
      .from(batch)
      .leftJoin(
        enrollment,
        and(eq(enrollment.batchId, batch.id), eq(enrollment.status, "ACTIVE")),
      )
      .groupBy(batch.id, batch.title)
      .orderBy(asc(batch.createdAt));
  }

  async getStudentsByBatchId(batchId: string): Promise<number> {
    const [result] = await db
      .select({
        totalStudents: countDistinct(enrollment.userId),
      })
      .from(enrollment)
      .where(
        and(eq(enrollment.batchId, batchId), eq(enrollment.status, "ACTIVE")),
      );

    return result.totalStudents;
  }
}

export const studentRepository = new StudentRepository();
