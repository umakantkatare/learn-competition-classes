import { db } from "@/db";
import { subject } from "@/db/schema/academic-schema";
import { eq } from "drizzle-orm";

export type Subject = typeof subject.$inferSelect;
export type NewSubject = typeof subject.$inferInsert;

export type UpdateSubject = Partial<Omit<NewSubject, "id">>;

export class SubjectRepository {
  // Create subject
  async create(data: NewSubject): Promise<Subject> {
    const [result] = await db.insert(subject).values(data).returning();

    if (!result) {
      throw new Error("Failed to create subject");
    }

    return result;
  }

  // Find subject by ID
  async findById(id: string): Promise<Subject | undefined> {
    const [result] = await db
      .select()
      .from(subject)
      .where(eq(subject.id, id))
      .limit(1);

    return result;
  }

  // Get all subjects
  async findAll(): Promise<Subject[]> {
    return db.select().from(subject);
  }

  // Update subject
  async update(id: string, data: UpdateSubject): Promise<Subject | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a subject");
    }

    const [result] = await db
      .update(subject)
      .set(data)
      .where(eq(subject.id, id))
      .returning();

    return result;
  }

  // Delete subject by ID
  async delete(id: string): Promise<Subject | undefined> {
    const [result] = await db
      .delete(subject)
      .where(eq(subject.id, id))
      .returning();

    return result;
  }
}

