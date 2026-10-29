import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { razorpay } from "@/lib/razorpay";

import {
  PaymentRepository,
  type NewPayment,
  type Payment,
} from "@/server/repositories/academic/payment-repository";

import { OrderRepository } from "@/server/repositories/academic/order-repository";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type VerifyPaymentResult = {
  success: true;
  message: string;
  payment: Payment;
};

type FailedPaymentResult = {
  success: true;
  message: string;
  payment: Payment;
};

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

export class PaymentService {
  constructor(
    private readonly paymentRepo = new PaymentRepository(),
    private readonly orderRepo = new OrderRepository(),
    private readonly enrollmentService = new EnrollmentService(),
  ) {}

  // ───────────────────────────────────────────
  // Validation helpers
  // ───────────────────────────────────────────

  private validateRequiredString(value: string, fieldName: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`${fieldName} is required.`);
    }
  }

  /**
   * Convert a decimal INR amount to paise without
   * relying on floating-point multiplication.
   *
   * Examples:
   * "100.00" -> 10000
   * "99.50"  -> 9950
   */
  private toPaise(amount: string | number): number {
    const value = String(amount).trim();

    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
      throw new Error("Invalid payment amount.");
    }

    const [rupees, fraction = ""] = value.split(".");
    const paise = Number(`${rupees}${fraction.padEnd(2, "0")}`);

    if (!Number.isSafeInteger(paise) || paise <= 0) {
      throw new Error("Payment amount must be positive.");
    }

    return paise;
  }

  // ───────────────────────────────────────────
  // Razorpay signature verification
  // ───────────────────────────────────────────

  private verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret is not configured.");
    }

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !/^[a-fA-F0-9]{64}$/.test(razorpaySignature)
    ) {
      return false;
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest();

    const receivedSignature = Buffer.from(razorpaySignature, "hex");

    return (
      receivedSignature.length === expectedSignature.length &&
      timingSafeEqual(expectedSignature, receivedSignature)
    );
  }

  // ───────────────────────────────────────────
  // Create pending payment record
  // ───────────────────────────────────────────

  async createPayment(data: NewPayment): Promise<Payment> {
    this.validateRequiredString(data.orderId, "Order ID");
    this.validateRequiredString(data.userId, "User ID");

    const order = await this.orderRepo.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.userId !== data.userId) {
      throw new Error("Payment user does not match the order owner.");
    }

    if (order.status !== "PENDING") {
      throw new Error("Only pending orders can be paid.");
    }

    if (this.toPaise(data.amount) !== this.toPaise(order.amount)) {
      throw new Error("Payment amount does not match the order amount.");
    }

    return this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      status: "PENDING",
      razorpayPaymentId: null,
      razorpaySignature: null,
    });
  }

  // ───────────────────────────────────────────
  // Verify and process successful payment
  // ───────────────────────────────────────────

  async verifyAndProcessPayment(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    userId: string,
  ): Promise<VerifyPaymentResult> {
    this.validateRequiredString(orderId, "Order ID");
    this.validateRequiredString(razorpayPaymentId, "Razorpay Payment ID");
    this.validateRequiredString(razorpaySignature, "Razorpay Signature");
    this.validateRequiredString(userId, "User ID");

    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.userId !== userId) {
      throw new Error("You are not authorized to access this order.");
    }

    if (!order.razorpayOrderId) {
      throw new Error("Razorpay order ID is missing.");
    }

    const signatureValid = this.verifyRazorpaySignature(
      order.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!signatureValid) {
      throw new Error("Invalid Razorpay payment signature.");
    }

    const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

    if (razorpayPayment.order_id !== order.razorpayOrderId) {
      throw new Error("Payment does not belong to this order.");
    }

    if (razorpayPayment.currency !== "INR") {
      throw new Error("Payment currency does not match INR.");
    }

    const expectedAmount = this.toPaise(order.amount);

    if (razorpayPayment.amount !== expectedAmount) {
      throw new Error("Payment amount does not match the order amount.");
    }

    if (
      razorpayPayment.status !== "captured" ||
      razorpayPayment.captured !== true
    ) {
      throw new Error("Payment has not been captured successfully.");
    }

    const existingPayment =
      await this.paymentRepo.findByRazorpayPaymentId(razorpayPaymentId);

    if (existingPayment) {
      if (
        existingPayment.orderId !== order.id ||
        existingPayment.userId !== order.userId
      ) {
        throw new Error("Payment record does not match the order.");
      }

      if (existingPayment.status === "SUCCESS") {
        if (order.status !== "PAID") {
          throw new Error(
            "Payment is successful but the order needs reconciliation.",
          );
        }

        return {
          success: true,
          message: "Payment was already processed.",
          payment: existingPayment,
        };
      }
    }

    if (order.status === "PAID") {
      throw new Error(
        "Order is already paid, but the payment record needs reconciliation.",
      );
    }

    if (order.status !== "PENDING") {
      throw new Error("Order is not eligible for payment processing.");
    }

    const payment = existingPayment
      ? await this.paymentRepo.update(existingPayment.id, {
          razorpaySignature,
          razorpayPaymentId,
          amount: order.amount,
          status: "SUCCESS",
        })
      : await this.paymentRepo.create({
          orderId: order.id,
          userId: order.userId,
          razorpayPaymentId,
          razorpaySignature,
          amount: order.amount,
          status: "SUCCESS",
        });

    if (!payment) {
      throw new Error("Failed to save the verified payment.");
    }

    const updatedOrder = await this.orderRepo.update(order.id, {
      status: "PAID",
    });

    if (!updatedOrder) {
      console.error("Payment succeeded, but order update failed.", {
        orderId: order.id,
        paymentId: razorpayPaymentId,
      });

      throw new Error(
        "Payment succeeded, but order processing needs reconciliation.",
      );
    }

    const enrollment = await this.enrollmentService.enrollStudent(
      order.userId,
      order.batchId,
      order.id,
    );

    if (!enrollment) {
      throw new Error("Payment succeeded, but enrollment processing failed.");
    }

    return {
      success: true,
      message: "Payment verified and enrollment processed.",
      payment,
    };
  }

  // ───────────────────────────────────────────
  // Handle failed payment
  // ───────────────────────────────────────────

  async handleFailedPayment(
    orderId: string,
    userId: string,
    _errorReason?: string,
  ): Promise<FailedPaymentResult> {
    this.validateRequiredString(orderId, "Order ID");
    this.validateRequiredString(userId, "User ID");

    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.userId !== userId) {
      throw new Error("You are not authorized to access this order.");
    }

    if (order.status === "PAID") {
      throw new Error("A paid order cannot be marked as failed.");
    }

    if (order.status !== "PENDING") {
      throw new Error("Order is not eligible for payment retries.");
    }

    const payment = await this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      status: "FAILED",
      razorpayPaymentId: null,
      razorpaySignature: null,
    });

    return {
      success: true,
      message: "Failed payment attempt recorded.",
      payment,
    };
  }

  // ───────────────────────────────────────────
  // Get payment by order ID
  // ───────────────────────────────────────────

  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    this.validateRequiredString(orderId, "Order ID");

    const payment = await this.paymentRepo.findByOrderId(orderId);

    if (!payment) {
      throw new Error("Payment record not found for this order.");
    }

    return payment;
  }
}
