import { db } from "@/db";
import { batchLectures } from "@/db/schema/academic-schema";
import { and, eq } from "drizzle-orm";

export type BatchLecture = typeof batchLectures.$inferSelect;
export type NewBatchLecture = typeof batchLectures.$inferInsert;

export class BatchLectureRepository {
  // Assign one lecture to a batch
  async create(data: NewBatchLecture): Promise<BatchLecture> {
    const [result] = await db.insert(batchLectures).values(data).returning();

    if (!result) {
      throw new Error("Failed to assign lecture to batch");
    }

    return result;
  }

  // Assign multiple lectures to a batch
  async createMany(data: NewBatchLecture[]): Promise<BatchLecture[]> {
    if (data.length === 0) {
      return [];
    }

    return db.insert(batchLectures).values(data).returning();
  }

  // Get all lectures assigned to a batch
  async findByBatchId(batchId: string): Promise<BatchLecture[]> {
    return db
      .select()
      .from(batchLectures)
      .where(eq(batchLectures.batchId, batchId));
  }

  // Get all batches containing a lecture
  async findByLectureId(lectureId: string): Promise<BatchLecture[]> {
    return db
      .select()
      .from(batchLectures)
      .where(eq(batchLectures.lectureId, lectureId));
  }

  // Remove one lecture from a batch
  async delete(
    batchId: string,
    lectureId: string,
  ): Promise<BatchLecture | undefined> {
    const [result] = await db
      .delete(batchLectures)
      .where(
        and(
          eq(batchLectures.batchId, batchId),
          eq(batchLectures.lectureId, lectureId),
        ),
      )
      .returning();

    return result;
  }

  // Remove all lecture assignments from a batch
  async deleteByBatchId(batchId: string): Promise<BatchLecture[]> {
    return db
      .delete(batchLectures)
      .where(eq(batchLectures.batchId, batchId))
      .returning();
  }
}
