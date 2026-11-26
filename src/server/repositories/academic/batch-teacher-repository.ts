
import { db } from "@/db";
import { batch, batchTeachers } from "@/db/schema/academic-schema";
import { and, eq, getTableColumns } from "drizzle-orm";

import type { DbExecutor } from "./batch-repository";

// ---------------------------------------------
// Types
// ---------------------------------------------

export type BatchTeacher = typeof batchTeachers.$inferSelect;
export type NewBatchTeacher = typeof batchTeachers.$inferInsert;

// ---------------------------------------------
// Batch Teacher Repository
// ---------------------------------------------

export class BatchTeacherRepository {
  // Assign one teacher to a batch
  async create(
    data: NewBatchTeacher,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher> {
    const [result] = await executor
      .insert(batchTeachers)
      .values(data)
      .returning();

    if (!result) {
      throw new Error("Failed to assign teacher to batch");
    }

    return result;
  }

  // Assign multiple teachers to batches
  async createMany(
    data: NewBatchTeacher[],
    executor: DbExecutor = db,
  ): Promise<BatchTeacher[]> {
    if (data.length === 0) {
      return [];
    }

    return executor
      .insert(batchTeachers)
      .values(data)
      .returning();
  }

  // Get teachers assigned to a batch
  async findByBatchId(
    batchId: string,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher[]> {
    return executor
      .select()
      .from(batchTeachers)
      .where(eq(batchTeachers.batchId, batchId));
  }

  // Get batch assignments of a teacher
  async findByTeacherId(
    teacherId: string,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher[]> {
    return executor
      .select()
      .from(batchTeachers)
      .where(eq(batchTeachers.teacherId, teacherId));
  }

  // Get all batches assigned to a teacher
 async findBatchesByTeacherId(
  teacherId: string,
  executor: DbExecutor = db,
) {
  return executor
    .select({
      ...getTableColumns(batch),
    })
    .from(batchTeachers)
    .innerJoin(
      batch,
      eq(batchTeachers.batchId, batch.id),
    )
    .where(eq(batchTeachers.teacherId, teacherId));
}

  // Find a specific teacher assignment
  async findAssignment(
    batchId: string,
    teacherId: string,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher | undefined> {
    const [result] = await executor
      .select()
      .from(batchTeachers)
      .where(
        and(
          eq(batchTeachers.batchId, batchId),
          eq(batchTeachers.teacherId, teacherId),
        ),
      )
      .limit(1);

    return result;
  }

  // Remove one teacher from a batch
  async delete(
    batchId: string,
    teacherId: string,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher | undefined> {
    const [result] = await executor
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

  // Remove all teachers from a batch
  async deleteByBatchId(
    batchId: string,
    executor: DbExecutor = db,
  ): Promise<BatchTeacher[]> {
    return executor
      .delete(batchTeachers)
      .where(eq(batchTeachers.batchId, batchId))
      .returning();
  }
}
