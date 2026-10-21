import { db } from "@/db";
import { batchTeachers } from "@/db/schema/academic-schema";
import { and, eq } from "drizzle-orm";

export type BatchTeacher = typeof batchTeachers.$inferSelect;
export type NewBatchTeacher = typeof batchTeachers.$inferInsert;

export class BatchTeacherRepository {
  // Assign one teacher to a batch
  async create(data: NewBatchTeacher): Promise<BatchTeacher> {
    const [result] = await db.insert(batchTeachers).values(data).returning();

    if (!result) {
      throw new Error("Failed to assign teacher to batch");
    }

    return result;
  }

  // Assign multiple teachers to a batch
  async createMany(data: NewBatchTeacher[]): Promise<BatchTeacher[]> {
    if (data.length === 0) {
      return [];
    }

    return db.insert(batchTeachers).values(data).returning();
  }

  // Get all teacher assignments for a batch
  async findByBatchId(batchId: string): Promise<BatchTeacher[]> {
    return db
      .select()
      .from(batchTeachers)
      .where(eq(batchTeachers.batchId, batchId));
  }

  // Get all batch assignments for a teacher
  async findByTeacherId(teacherId: string): Promise<BatchTeacher[]> {
    return db
      .select()
      .from(batchTeachers)
      .where(eq(batchTeachers.teacherId, teacherId));
  }

  // Remove one teacher from a batch
  async delete(
    batchId: string,
    teacherId: string,
  ): Promise<BatchTeacher | undefined> {
    const [result] = await db
      .delete(batchTeachers)
      .where(
        and(
          eq(batchTeachers.batchId, batchId),
          eq(batchTeachers.teacherId, teacherId),
        ),
      )
      .returning();

    return result;
  }

  // Remove all teacher assignments from a batch
  async deleteByBatchId(batchId: string): Promise<BatchTeacher[]> {
    return db
      .delete(batchTeachers)
      .where(eq(batchTeachers.batchId, batchId))
      .returning();
  }
}
