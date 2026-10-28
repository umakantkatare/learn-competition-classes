import { db } from "@/db";
import { payments } from "@/db/schema/academic-schema";
import { eq, desc } from "drizzle-orm";

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type UpdatePayment = Partial<Omit<NewPayment, "id">>;

export class PaymentRepository {
  // Create payment record
  async create(data: NewPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(data).returning();

    if (!result) {
      throw new Error("Failed to create payment record");
    }

    return result;
  }

  // Find payment by internal ID
  async findById(id: string): Promise<Payment | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    return result;
  }

  // Find payment by order ID
  async findByOrderId(orderId: string): Promise<Payment | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    return result;
  }

  // Find payment by Razorpay payment ID
  async findByRazorpayPaymentId(
    razorpayPaymentId: string,
  ): Promise<Payment | undefined> {
    const [result] = await db
      .select()
      .from(payments)
      .where(eq(payments.razorpayPaymentId, razorpayPaymentId))
      .limit(1);

    return result;
  }

  // Get all payments for a user, newest first
  async findByUserId(userId: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  // Update payment record
  async update(id: string, data: UpdatePayment): Promise<Payment | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a payment");
    }

    const [result] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();

    return result;
  }

  // Find all payment attempts for an order, newest first.
  async findAllByOrderId(orderId: string): Promise<Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .orderBy(desc(payments.createdAt));
  }

  // Update a payment using its Razorpay payment ID.
  async updateByRazorpayPaymentId(
    razorpayPaymentId: string,
    data: UpdatePayment,
  ): Promise<Payment | undefined> {
    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a payment");
    }

    const [result] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.razorpayPaymentId, razorpayPaymentId))
      .returning();

    return result;
  }
}
