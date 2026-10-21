import { db } from "@/db";
import { examination } from "@/db/schema/academic-schema";
import { eq, and } from "drizzle-orm";

export type Examination = typeof examination.$inferSelect;
export type NewExamination = typeof examination.$inferInsert;

export type UpdateExamination = Partial<Omit<NewExamination, "id">>;

export class ExaminationRepository {
  // Create examination
  async create(data: NewExamination): Promise<Examination> {
    const [result] = await db.insert(examination).values(data).returning();

    if (!result) {
      throw new Error("Failed to create examination");
    }

    return result;
  }

  async findById(id: string): Promise<Examination | undefined> {
    const [result] = await db
      .select()
      .from(examination)
      .where(eq(examination.id, id))
      .limit(1);

    return result;
  }

  async findByCategory(categoryId: string): Promise<Examination[]> {
    return db
      .select()
      .from(examination)
      .where(eq(examination.categoryId, categoryId));
  }

  async findActiveByCategory(categoryId: string): Promise<Examination[]> {
    return db
      .select()
      .from(examination)
      .where(
        and(
          eq(examination.categoryId, categoryId),
          eq(examination.isActive, true),
        ),
      );
  }

  async update(
    id: string,
    data: UpdateExamination,
  ): Promise<Examination | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error(
        "At least one field is required to update an examination",
      );
    }

    const [result] = await db
      .update(examination)
      .set(data)
      .where(eq(examination.id, id))
      .returning();

    return result;
  }

  async deactivate(id: string): Promise<Examination | undefined> {
    const [result] = await db
      .update(examination)
      .set({ isActive: false })
      .where(eq(examination.id, id))
      .returning();

    return result;
  }
}
