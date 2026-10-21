
import { db } from "@/db";
import { orders } from "@/db/schema/academic-schema";
import { eq, desc } from "drizzle-orm";

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type UpdateOrder = Partial<
  Omit<NewOrder, "id">
>;

export class OrderRepository {
  // Create order
  async create(data: NewOrder): Promise<Order> {
    const [result] = await db
      .insert(orders)
      .values(data)
      .returning();

    if (!result) {
      throw new Error("Failed to create order");
    }

    return result;
  }

  // Find order by internal ID
  async findById(id: string): Promise<Order | undefined> {
    const [result] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    return result;
  }

  // Find all orders for a user
  async findByUserId(userId: string): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  // Find order by Razorpay order ID
  async findByRazorpayOrderId(
    razorpayOrderId: string,
  ): Promise<Order | undefined> {
    const [result] = await db
      .select()
      .from(orders)
      .where(eq(orders.razorpayOrderId, razorpayOrderId))
      .limit(1);

    return result;
  }

  // Update order
  async update(
    id: string,
    data: UpdateOrder,
  ): Promise<Order | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update an order");
    }

    const [result] = await db
      .update(orders)
      .set(data)
      .where(eq(orders.id, id))
      .returning();

    return result;
  }
}
