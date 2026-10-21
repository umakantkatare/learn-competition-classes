import { db } from "@/db";
import { batch } from "@/db/schema/academic-schema";
import { and, eq } from "drizzle-orm";

// Drizzle inferred types
export type Batch = typeof batch.$inferSelect;
export type NewBatch = typeof batch.$inferInsert;

export type UpdateBatch = Partial<Omit<NewBatch, "id">>;

export class BatchRepository {
  // Create batch
  async create(data: NewBatch): Promise<Batch> {
    const [result] = await db.insert(batch).values(data).returning();

    if (!result) {
      throw new Error("Failed to create batch");
    }

    return result;
  }

  // Find batch by ID
  async findById(id: string): Promise<Batch | undefined> {
    const [result] = await db
      .select()
      .from(batch)
      .where(eq(batch.id, id))
      .limit(1);

    return result;
  }

  // Find published batch by ID (public access)
  async findPublishedById(id: string): Promise<Batch | undefined> {
    const [result] = await db
      .select()
      .from(batch)
      .where(and(eq(batch.id, id), eq(batch.isPublished, true)))
      .limit(1);

    return result;
  }

  // Find batch by slug
  async findBySlug(slug: string): Promise<Batch | undefined> {
    const [result] = await db
      .select()
      .from(batch)
      .where(eq(batch.slug, slug))
      .limit(1);

    return result;
  }

  // Find published batch by slug (public access)
  async findPublishedBySlug(slug: string): Promise<Batch | undefined> {
    const [result] = await db
      .select()
      .from(batch)
      .where(and(eq(batch.slug, slug), eq(batch.isPublished, true)))
      .limit(1);

    return result;
  }

  // Find all batches for an examination (admin/internal use)
  async findByExaminationId(examinationId: string): Promise<Batch[]> {
    return db
      .select()
      .from(batch)
      .where(eq(batch.examinationId, examinationId));
  }

  // Find published batches for an examination (public use)
  async findPublishedByExaminationId(examinationId: string): Promise<Batch[]> {
    return db
      .select()
      .from(batch)
      .where(
        and(
          eq(batch.examinationId, examinationId),
          eq(batch.isPublished, true),
        ),
      );
  }

  // Update batch
  async update(id: string, data: UpdateBatch): Promise<Batch | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a batch");
    }

    const [result] = await db
      .update(batch)
      .set(data)
      .where(eq(batch.id, id))
      .returning();

    return result;
  }

  // Publish batch
  async publish(id: string): Promise<Batch | undefined> {
    const [result] = await db
      .update(batch)
      .set({ isPublished: true })
      .where(eq(batch.id, id))
      .returning();

    return result;
  }

  // Unpublish batch instead of permanent deletion
  async unpublish(id: string): Promise<Batch | undefined> {
    const [result] = await db
      .update(batch)
      .set({ isPublished: false })
      .where(eq(batch.id, id))
      .returning();

    return result;
  }
}
