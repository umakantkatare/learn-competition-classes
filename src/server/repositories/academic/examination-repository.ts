import { db } from "@/db";
import { examCategory, examination } from "@/db/schema/academic-schema";
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

  //  Get all examinations with category fields
  async getAllExaminations() {
    return db
      .select({
        id: examination.id,
        name: examination.name,
        slug: examination.slug,
        isActive: examination.isActive,
        categoryId: examCategory.id,
        categoryName: examCategory.name,
        categorySlug: examCategory.slug,
        createdAt: examination.createdAt,
      })
      .from(examination)
      .leftJoin(examCategory, eq(examination.categoryId, examCategory.id))
      .orderBy(examination.createdAt);
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

  async findBySlug(slug: string) {
    const [result] = await db
      .select()
      .from(examination)
      .where(eq(examination.slug, slug))
      .limit(1);

    return result;
  }

  async deactivate(id: string) {
    const [result] = await db
      .update(examination)
      .set({ isActive: false })
      .where(eq(examination.id, id))
      .returning();

    return result;
  }
}
