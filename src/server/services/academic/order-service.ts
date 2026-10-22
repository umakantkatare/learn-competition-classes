import {
  OrderRepository,
  NewOrder,
} from "@/server/repositories/academic/order-repository";
import { BatchRepository } from "@/server/repositories/academic/batch-repository";
import { EnrollmentRepository } from "@/server/repositories/academic/enrollment-repository";

type OrderStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED";

export class OrderService {
  private readonly orderRepo: OrderRepository;
  private readonly batchRepo: BatchRepository;
  private readonly enrollmentRepo: EnrollmentRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.batchRepo = new BatchRepository();
    this.enrollmentRepo = new EnrollmentRepository();
  }

  // 1. Create a pending order
  async createOrder(data: NewOrder) {
    if (!data.userId || !data.batchId) {
      throw new Error("User ID and batch ID are required.");
    }

    const batch = await this.batchRepo.findById(data.batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    if (!batch.isPublished) {
      throw new Error("This batch is not available for purchase.");
    }

    const existingEnrollment = await this.enrollmentRepo.checkEnrollment(
      data.userId,
      data.batchId,
    );

    if (existingEnrollment?.status === "ACTIVE") {
      throw new Error("User is already enrolled in this batch.");
    }

    // Never trust the amount submitted by the client.
    const expectedAmount = Number(batch.discountPrice);

    if (!Number.isFinite(expectedAmount) || expectedAmount < 0) {
      throw new Error("Batch price is invalid.");
    }

    // Free purchases should use a separate enrollment flow.
    if (expectedAmount === 0) {
      throw new Error("This batch is free. Use the free enrollment flow.");
    }

    // Override the client-provided amount and status.
    const orderData = {
      ...data,
      amount: String(expectedAmount),
      status: "PENDING",
    } as NewOrder;

    return this.orderRepo.create(orderData);
  }

  // 2. Get an order by internal database ID
  async getOrderById(id: string) {
    if (!id) {
      throw new Error("Order ID is required.");
    }

    const order = await this.orderRepo.findById(id);

    if (!order) {
      throw new Error("Order not found.");
    }

    return order;
  }

  // 3. Get a user's order history
  async getUserOrders(userId: string) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return this.orderRepo.findByUserId(userId);
  }

  // 4. Find an order using Razorpay's order ID
  async getOrderByRazorpayId(razorpayOrderId: string) {
    if (!razorpayOrderId) {
      throw new Error("Razorpay order ID is required.");
    }

    const order = await this.orderRepo.findByRazorpayOrderId(razorpayOrderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    return order;
  }

  // 5. Update order status with transition checks
  async updateOrderStatus(id: string, status: OrderStatus) {
    const existingOrder = await this.orderRepo.findById(id);

    if (!existingOrder) {
      throw new Error("Order not found.");
    }

    // Idempotent repeat of the current status.
    if (existingOrder.status === status) {
      return existingOrder;
    }

    // Terminal states cannot be changed through this method.
    if (existingOrder.status !== "PENDING") {
      throw new Error(
        `Cannot change order status from ${existingOrder.status} to ${status}.`,
      );
    }

    const updatedOrder = await this.orderRepo.update(id, { status });

    if (!updatedOrder) {
      throw new Error("Failed to update order status.");
    }

    return updatedOrder;
  }
}
