import { db } from "@/db";
import { chapter } from "@/db/schema/academic-schema";
import { and, asc, eq, max, sql } from "drizzle-orm";

export type Chapter = typeof chapter.$inferSelect;
export type NewChapter = typeof chapter.$inferInsert;

export type UpdateChapter = Partial<Omit<NewChapter, "id">>;

export class ChapterRepository {
  // Create chapter
  async create(data: NewChapter): Promise<Chapter> {
    const [result] = await db
      .select({
        maxSortOrder: max(chapter.sortOrder),
      })
      .from(chapter)
      .where(eq(chapter.subjectId, data.subjectId));

    const nextSortOrder = (result.maxSortOrder ?? 0) + 1;

    const [createdChapter] = await db
      .insert(chapter)
      .values({
        ...data,
        sortOrder: nextSortOrder,
      })
      .returning();

    if (!createdChapter) {
      throw new Error("Failed to create chapter");
    }

    return createdChapter;
  }

  // Find chapter by ID
  async findById(id: string): Promise<Chapter | undefined> {
    const [result] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, id))
      .limit(1);

    return result;
  }

  // Get chapters for a subject
  async findBySubjectId(subjectId: string): Promise<Chapter[]> {
    return db
      .select()
      .from(chapter)
      .where(eq(chapter.subjectId, subjectId))
      .orderBy(asc(chapter.id));
  }

  // Update chapter
  async update(id: string, data: UpdateChapter): Promise<Chapter | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a chapter");
    }

    const [result] = await db
      .update(chapter)
      .set(data)
      .where(eq(chapter.id, id))
      .returning();

    return result;
  }

  // Delete chapter
  async delete(id: string): Promise<Chapter | undefined> {
    // Find chapter before deleting
    const [existingChapter] = await db
      .select()
      .from(chapter)
      .where(eq(chapter.id, id))
      .limit(1);

    if (!existingChapter) {
      return undefined;
    }

    // Delete the chapter
    const [deletedChapter] = await db
      .delete(chapter)
      .where(eq(chapter.id, id))
      .returning();

    if (!deletedChapter) {
      throw new Error("Failed to delete chapter");
    }

    // Decrement sortOrder for subsequent chapters
    await db
      .update(chapter)
      .set({
        sortOrder: sql`${chapter.sortOrder} - 1`,
      })
      .where(
        and(
          eq(chapter.subjectId, existingChapter.subjectId),
          sql`${chapter.sortOrder} > ${existingChapter.sortOrder}`,
        ),
      );

    return deletedChapter;
  }
}
