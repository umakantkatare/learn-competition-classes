import { db } from "@/db";
import { batch } from "@/db/schema/academic-schema";
import { and, eq } from "drizzle-orm";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Batch = typeof batch.$inferSelect;

export type NewBatch = typeof batch.$inferInsert;

export type UpdateBatch = Partial<Omit<NewBatch, "id" | "createdBy">>;

// Transaction executor
export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type DbExecutor = typeof db | DbTransaction;

/* -------------------------------------------------------------------------- */
/* Batch Repository                                                           */
/* -------------------------------------------------------------------------- */

export class BatchRepository {
  /* ------------------------------------------------------------------------ */
  /* Create Batch                                                             */
  /* ------------------------------------------------------------------------ */

  async create(data: NewBatch, executor: DbExecutor = db): Promise<Batch> {
    const [result] = await executor.insert(batch).values(data).returning();

    if (!result) {
      throw new Error("Failed to create batch");
    }

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Find All Batches                                                         */
  /* ------------------------------------------------------------------------ */

  async findAll(executor: DbExecutor = db): Promise<Batch[]> {
    return executor.select().from(batch);
  }

  /* ------------------------------------------------------------------------ */
  /* Find All Published Batches                                               */
  /* ------------------------------------------------------------------------ */

  async findAllPublished(executor: DbExecutor = db): Promise<Batch[]> {
    return executor.select().from(batch).where(eq(batch.isPublished, true));
  }

  /* ------------------------------------------------------------------------ */
  /* Find Batch By ID                                                         */
  /* ------------------------------------------------------------------------ */

  async findById(
    id: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .select()
      .from(batch)
      .where(eq(batch.id, id))
      .limit(1);

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Find Published Batch By ID                                               */
  /* ------------------------------------------------------------------------ */

  async findPublishedById(
    id: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .select()
      .from(batch)
      .where(and(eq(batch.id, id), eq(batch.isPublished, true)))
      .limit(1);

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Find Batch By Slug                                                       */
  /* ------------------------------------------------------------------------ */

  async findBySlug(
    slug: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .select()
      .from(batch)
      .where(eq(batch.slug, slug))
      .limit(1);

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Find Published Batch By Slug                                             */
  /* ------------------------------------------------------------------------ */

  async findPublishedBySlug(
    slug: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .select()
      .from(batch)
      .where(and(eq(batch.slug, slug), eq(batch.isPublished, true)))
      .limit(1);

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Find Batches By Examination                                              */
  /* ------------------------------------------------------------------------ */

  async findByExaminationId(
    examinationId: string,
    executor: DbExecutor = db,
  ): Promise<Batch[]> {
    return executor
      .select()
      .from(batch)
      .where(eq(batch.examinationId, examinationId));
  }

  /* ------------------------------------------------------------------------ */
  /* Find Published Batches By Examination                                    */
  /* ------------------------------------------------------------------------ */

  async findPublishedByExaminationId(
    examinationId: string,
    executor: DbExecutor = db,
  ): Promise<Batch[]> {
    return executor
      .select()
      .from(batch)
      .where(
        and(
          eq(batch.examinationId, examinationId),
          eq(batch.isPublished, true),
        ),
      );
  }

  /* ------------------------------------------------------------------------ */
  /* Update Batch                                                             */
  /* ------------------------------------------------------------------------ */

  async update(
    id: string,
    data: UpdateBatch,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a batch");
    }

    const updateData: UpdateBatch = { ...data };

    // Keep expiryDate and validityMonths mutually exclusive.
    if (data.expiryDate !== undefined && data.expiryDate !== null) {
      updateData.validityMonths = null;
    }

    if (data.validityMonths !== undefined && data.validityMonths !== null) {
      updateData.expiryDate = null;
    }

    const [result] = await executor
      .update(batch)
      .set(updateData)
      .where(eq(batch.id, id))
      .returning();

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Publish Batch                                                            */
  /* ------------------------------------------------------------------------ */

  async publish(
    id: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .update(batch)
      .set({ isPublished: true })
      .where(eq(batch.id, id))
      .returning();

    return result;
  }

  /* ------------------------------------------------------------------------ */
  /* Unpublish Batch                                                          */
  /* ------------------------------------------------------------------------ */

  async unpublish(
    id: string,
    executor: DbExecutor = db,
  ): Promise<Batch | undefined> {
    const [result] = await executor
      .update(batch)
      .set({ isPublished: false })
      .where(eq(batch.id, id))
      .returning();

    return result;
  }
}
