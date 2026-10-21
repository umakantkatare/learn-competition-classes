import { db } from "@/db";
import { lecture } from "@/db/schema/academic-schema";
import { asc, eq } from "drizzle-orm";

export type Lecture = typeof lecture.$inferSelect;
export type NewLecture = typeof lecture.$inferInsert;

export type UpdateLecture = Partial<Omit<NewLecture, "id">>;

export class LectureRepository {
  // Create lecture
  async create(data: NewLecture): Promise<Lecture> {
    const [result] = await db.insert(lecture).values(data).returning();

    if (!result) {
      throw new Error("Failed to create lecture");
    }

    return result;
  }

  // Find lecture by ID
  async findById(id: string): Promise<Lecture | undefined> {
    const [result] = await db
      .select()
      .from(lecture)
      .where(eq(lecture.id, id))
      .limit(1);

    return result;
  }

  // Get all lectures for a chapter
  async findByChapterId(chapterId: string): Promise<Lecture[]> {
    return db
      .select()
      .from(lecture)
      .where(eq(lecture.chapterId, chapterId))
      .orderBy(asc(lecture.id));
  }

  // Update lecture
  async update(id: string, data: UpdateLecture): Promise<Lecture | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a lecture");
    }

    const [result] = await db
      .update(lecture)
      .set(data)
      .where(eq(lecture.id, id))
      .returning();

    return result;
  }

  // Delete lecture
  async delete(id: string): Promise<Lecture | undefined> {
    const [result] = await db
      .delete(lecture)
      .where(eq(lecture.id, id))
      .returning();

    return result;
  }
}
