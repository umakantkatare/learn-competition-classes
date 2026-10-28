import "server-only";

import {
  OrderRepository,
  type NewOrder,
} from "@/server/repositories/academic/order-repository";
import { BatchRepository } from "@/server/repositories/academic/batch-repository";
import { EnrollmentRepository } from "@/server/repositories/academic/enrollment-repository";

import { razorpay, razorpayKeyId } from "@/lib/razorpay";

import {
  createOrderSchema,
  OrderStatus,
} from "@/validations/academic/order-validation";
type CreateOrderParams = {
  userId: string;
  batchId: string;
};

type CreateOrderResult = {
  id: string;
  amount: string;
  currency: "INR";
  razorpayOrderId: string;
  keyId: string;
};

export class OrderService {
  private readonly orderRepo: OrderRepository;
  private readonly batchRepo: BatchRepository;
  private readonly enrollmentRepo: EnrollmentRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.batchRepo = new BatchRepository();
    this.enrollmentRepo = new EnrollmentRepository();
  }

  async createOrder(data: CreateOrderParams): Promise<CreateOrderResult> {
    const { userId, batchId } = data;

    if (!userId || !batchId) {
      throw new Error("User ID and batch ID are required.");
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    if (!batch.isPublished) {
      throw new Error("This batch is not available for purchase.");
    }

    const enrollment = await this.enrollmentRepo.checkEnrollment(
      userId,
      batchId,
    );

    if (enrollment?.status === "ACTIVE") {
      throw new Error("User is already enrolled in this batch.");
    }

    const originalPrice = Number(batch.originalPrice);

    if (!Number.isFinite(originalPrice) || originalPrice <= 0) {
      throw new Error("Original batch price is invalid.");
    }

    const discountPrice =
      batch.discountPrice == null ? null : Number(batch.discountPrice);

    if (
      discountPrice !== null &&
      (!Number.isFinite(discountPrice) ||
        discountPrice <= 0 ||
        discountPrice > originalPrice)
    ) {
      throw new Error("Discount batch price is invalid.");
    }

    const amount = discountPrice ?? originalPrice;

    const amountInPaise = Math.round(amount * 100);
    console.log("type of amout-paise", typeof(amountInPaise));

    if (!Number.isSafeInteger(amountInPaise) || amountInPaise <= 0) {
      throw new Error("Batch price cannot be processed.");
    }

    if (Math.abs(amount * 100 - amountInPaise) > 1e-7) {
      throw new Error("Batch price must have at most two decimal places.");
    }

    const validatedOrder = createOrderSchema.parse({
      userId,
      batchId,
      amount: amount.toFixed(2),
      status: "PENDING",
    });

    const localOrder = await this.orderRepo.create({
      userId: validatedOrder.userId,
      batchId: validatedOrder.batchId,
      amount: validatedOrder.amount,
      status: validatedOrder.status,
    } satisfies NewOrder);

    let razorpayOrderCreated = false;

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `order_${localOrder.id}`,
        notes: {
          internalOrderId: localOrder.id,
          userId,
          batchId,
        },
      });

      razorpayOrderCreated = true;

      const updatedOrder = await this.orderRepo.update(localOrder.id, {
        razorpayOrderId: razorpayOrder.id,
      });

      if (!updatedOrder) {
        throw new Error(
          "Razorpay order was created, but local order synchronization failed.",
        );
      }

      return {
        id: updatedOrder.id,
        amount: amount.toFixed(2),
        currency: "INR",
        razorpayOrderId: razorpayOrder.id,
        keyId: razorpayKeyId,
      };
    } catch (error) {
      console.error(
        razorpayOrderCreated
          ? "Razorpay order created, but local synchronization failed."
          : "Razorpay order creation failed or its outcome is uncertain.",
        {
          localOrderId: localOrder.id,
          error,
        },
      );

      throw error;
    }
  }

  /**
   * Retrieve an order by its internal ID.
   */
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

  /**
   * Retrieve all orders for a user.
   */
  async getUserOrders(userId: string) {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    return this.orderRepo.findByUserId(userId);
  }

  /**
   * Retrieve an order using its Razorpay order ID.
   */
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

  /**
   * Update an order's status.
   *
   * This method must only be called by trusted server-side workflows.
   * PAID must require verified payment evidence.
   */
  async updateOrderStatus(id: string, status: OrderStatus) {
    if (!id) {
      throw new Error("Order ID is required.");
    }

    const existingOrder = await this.orderRepo.findById(id);

    if (!existingOrder) {
      throw new Error("Order not found.");
    }

    if (existingOrder.status === status) {
      return existingOrder;
    }

    if (existingOrder.status !== "PENDING") {
      throw new Error(
        `Cannot change order status from ${existingOrder.status} to ${status}.`,
      );
    }

    const updatedOrder = await this.orderRepo.update(id, {
      status,
    });

    if (!updatedOrder) {
      throw new Error("Failed to update order status.");
    }

    return updatedOrder;
  }
}
