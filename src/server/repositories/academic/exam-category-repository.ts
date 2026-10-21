import { db } from "@/db";
import { examCategory } from "@/db/schema/academic-schema";
import { eq } from "drizzle-orm";

export type ExamCategory = typeof examCategory.$inferSelect;
export type NewExamCategory = typeof examCategory.$inferInsert;

export type UpdateExamCategory = Partial<Omit<NewExamCategory, "id">>;

export class ExamCategoryRepository {
  // Create category
  async create(data: NewExamCategory): Promise<ExamCategory> {
    const [result] = await db.insert(examCategory).values(data).returning();

    if (!result) {
      throw new Error("Failed to create exam category");
    }

    return result;
  }

  // Find category by ID
  async findById(id: string): Promise<ExamCategory | undefined> {
    const [result] = await db
      .select()
      .from(examCategory)
      .where(eq(examCategory.id, id))
      .limit(1);

    return result;
  }

  // Find category by slug
  async findBySlug(slug: string): Promise<ExamCategory | undefined> {
    const [result] = await db
      .select()
      .from(examCategory)
      .where(eq(examCategory.slug, slug))
      .limit(1);

    return result;
  }

  // Find all active categories
  async findAllActive(): Promise<ExamCategory[]> {
    return db
      .select()
      .from(examCategory)
      .where(eq(examCategory.isActive, true));
  }

  // Update category
  async update(
    id: string,
    data: UpdateExamCategory,
  ): Promise<ExamCategory | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a category");
    }

    const [result] = await db
      .update(examCategory)
      .set(data)
      .where(eq(examCategory.id, id))
      .returning();

    return result;
  }

  // Soft delete: deactivate category
  async deactivate(id: string): Promise<ExamCategory | undefined> {
    const [result] = await db
      .update(examCategory)
      .set({ isActive: false })
      .where(eq(examCategory.id, id))
      .returning();

    return result;
  }
}
