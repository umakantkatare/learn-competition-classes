import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { razorpay } from "@/lib/razorpay";

import {
  PaymentRepository,
  type NewPayment,
  type Payment,
} from "@/server/repositories/academic/payment-repository";

import {
  OrderRepository,
  type Order,
} from "@/server/repositories/academic/order-repository";

import { EnrollmentService } from "@/server/services/academic/enrollment-service";

// --------------------------------------------------
// Types
// --------------------------------------------------

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

// --------------------------------------------------
// Custom Error
// --------------------------------------------------

export class PaymentServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "PaymentServiceError";
  }
}

// --------------------------------------------------
// Payment Service
// --------------------------------------------------

export class PaymentService {
  constructor(
    private readonly paymentRepo = new PaymentRepository(),
    private readonly orderRepo = new OrderRepository(),
    private readonly enrollmentService = new EnrollmentService(),
  ) {}

  // ------------------------------------------------
  // 1. Validation Helpers
  // ------------------------------------------------

  private validateRequiredString(value: string, fieldName: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new PaymentServiceError(
        `${fieldName} is required.`,
        400,
        "INVALID_INPUT",
      );
    }
  }

  // ------------------------------------------------
  // 2. Currency Helpers
  // ------------------------------------------------

  private toPaise(amount: string | number): number {
    const value = String(amount).trim();

    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
      throw new PaymentServiceError(
        "Invalid payment amount.",
        400,
        "INVALID_AMOUNT",
      );
    }

    const [rupees, fraction = ""] = value.split(".");

    const paise = Number(`${rupees}${fraction.padEnd(2, "0")}`);

    if (!Number.isSafeInteger(paise) || paise <= 0) {
      throw new PaymentServiceError(
        "Payment amount must be positive.",
        400,
        "INVALID_AMOUNT",
      );
    }

    return paise;
  }

  // ------------------------------------------------
  // 3. Razorpay Signature Verification
  // ------------------------------------------------

  private verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new PaymentServiceError(
        "Razorpay secret is not configured.",
        500,
        "RAZORPAY_CONFIGURATION_ERROR",
      );
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

    if (receivedSignature.length !== expectedSignature.length) {
      return false;
    }

    return timingSafeEqual(expectedSignature, receivedSignature);
  }

  // ------------------------------------------------
  // 4. Verify Payment with Razorpay
  // ------------------------------------------------

  private async fetchVerifiedPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    expectedAmount: number,
  ) {
    const isValid = this.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );

    if (!isValid) {
      throw new PaymentServiceError(
        "Invalid Razorpay payment signature.",
        400,
        "INVALID_SIGNATURE",
      );
    }

    let payment;

    try {
      payment = await razorpay.payments.fetch(razorpayPaymentId);
    } catch (error) {
      console.error("[PaymentService] Razorpay fetch failed:", error);

      throw new PaymentServiceError(
        "Unable to verify payment with Razorpay.",
        502,
        "RAZORPAY_FETCH_FAILED",
      );
    }

    if (payment.order_id !== razorpayOrderId) {
      throw new PaymentServiceError(
        "Payment does not belong to this order.",
        400,
        "ORDER_MISMATCH",
      );
    }

    if (payment.currency !== "INR") {
      throw new PaymentServiceError(
        "Payment currency does not match INR.",
        400,
        "CURRENCY_MISMATCH",
      );
    }

    if (payment.amount !== expectedAmount) {
      throw new PaymentServiceError(
        "Payment amount does not match the order amount.",
        400,
        "AMOUNT_MISMATCH",
      );
    }

    if (payment.status !== "captured" || payment.captured !== true) {
      throw new PaymentServiceError(
        "Payment has not been captured successfully.",
        409,
        "PAYMENT_NOT_CAPTURED",
      );
    }

    return payment;
  }

  // ------------------------------------------------
  // 5. Create Pending Payment
  // ------------------------------------------------

  async createPayment(data: NewPayment): Promise<Payment> {
    this.validateRequiredString(data.orderId, "Order ID");
    this.validateRequiredString(data.userId, "User ID");

    const order = await this.orderRepo.findById(data.orderId);

    if (!order) {
      throw new PaymentServiceError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    if (order.userId !== data.userId) {
      throw new PaymentServiceError(
        "Payment user does not match order owner.",
        403,
        "ORDER_ACCESS_DENIED",
      );
    }

    if (order.status !== "PENDING") {
      throw new PaymentServiceError(
        "Only pending orders can be paid.",
        409,
        "ORDER_NOT_PAYABLE",
      );
    }

    if (this.toPaise(data.amount) !== this.toPaise(order.amount)) {
      throw new PaymentServiceError(
        "Payment amount does not match order amount.",
        400,
        "AMOUNT_MISMATCH",
      );
    }

    // Reuse an existing pending attempt
    const attempts = await this.paymentRepo.findAllByOrderId(order.id);

    const pendingAttempt = attempts.find(
      (attempt) => attempt.status === "PENDING",
    );

    if (pendingAttempt) {
      return pendingAttempt;
    }

    if (attempts.some((attempt) => attempt.status === "SUCCESS")) {
      throw new PaymentServiceError(
        "A successful payment already exists for this order.",
        409,
        "PAYMENT_ALREADY_SUCCESSFUL",
      );
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

  // ------------------------------------------------
  // 6. Save Successful Payment
  // ------------------------------------------------

  private async saveSuccessfulPayment(
    orderId: string,
    userId: string,
    amount: string | number,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): Promise<Payment> {
    // Check duplicate Razorpay payment ID
    const existingByPaymentId =
      await this.paymentRepo.findByRazorpayPaymentId(razorpayPaymentId);

    if (existingByPaymentId) {
      if (
        existingByPaymentId.orderId !== orderId ||
        existingByPaymentId.userId !== userId
      ) {
        throw new PaymentServiceError(
          "Payment record does not match the order.",
          409,
          "PAYMENT_RECORD_MISMATCH",
        );
      }

      if (existingByPaymentId.status === "SUCCESS") {
        return existingByPaymentId;
      }

      const updated = await this.paymentRepo.update(existingByPaymentId.id, {
        status: "SUCCESS",
        amount: String(amount),
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!updated) {
        throw new PaymentServiceError(
          "Failed to update payment record.",
          500,
          "PAYMENT_UPDATE_FAILED",
        );
      }

      return updated;
    }

    // Get all attempts for this order
    const attempts = await this.paymentRepo.findAllByOrderId(orderId);

    // Find a pending attempt to update
    const pendingAttempt = attempts.find(
      (attempt) => attempt.status === "PENDING",
    );

    if (pendingAttempt) {
      const updated = await this.paymentRepo.update(pendingAttempt.id, {
        status: "SUCCESS",
        amount: String(amount),
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!updated) {
        throw new PaymentServiceError(
          "Failed to update payment record.",
          500,
          "PAYMENT_UPDATE_FAILED",
        );
      }

      return updated;
    }

    // No pending attempt: create a successful attempt.
    // This also records a separately captured payment.
    return this.paymentRepo.create({
      orderId,
      userId,
      amount: String(amount),
      status: "SUCCESS",
      razorpayPaymentId,
      razorpaySignature,
    });
  }

  // ------------------------------------------------
  // 7. Update Order Status
  // ------------------------------------------------

  private async ensureOrderPaid(order: Order): Promise<void> {
    if (!order) {
      throw new PaymentServiceError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    if (order.status === "PAID") {
      return;
    }

    if (order.status !== "PENDING") {
      throw new PaymentServiceError(
        "Order is not eligible for payment processing.",
        409,
        "ORDER_NOT_PAYABLE",
      );
    }

    const updated = await this.orderRepo.update(order.id, {
      status: "PAID",
    });

    if (!updated) {
      throw new PaymentServiceError(
        "Payment succeeded, but order update failed.",
        500,
        "ORDER_UPDATE_FAILED",
      );
    }
  }

  // ------------------------------------------------
  // 8. Ensure Enrollment
  // ------------------------------------------------

  private async ensureEnrollment(
    userId: string,
    batchId: string,
    orderId: string,
  ): Promise<void> {
    try {
      // Avoid duplicate enrollment on payment retries
      const hasAccess = await this.enrollmentService.hasValidAccess(
        userId,
        batchId,
      );

      if (hasAccess) {
        return;
      }

      await this.enrollmentService.enrollStudent(userId, batchId, orderId);
    } catch (error) {
      console.error("[PaymentService] Enrollment failed:", {
        userId,
        batchId,
        orderId,
        error,
      });

      if (error instanceof PaymentServiceError) {
        throw error;
      }

      throw new PaymentServiceError(
        "Payment succeeded, but enrollment processing failed. Reconciliation is required.",
        500,
        "ENROLLMENT_PROCESSING_FAILED",
      );
    }
  }

  // ------------------------------------------------
  // 9. Verify and Process Payment
  // ------------------------------------------------

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

    // 1. Fetch local order
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new PaymentServiceError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    // 2. Verify ownership
    if (order.userId !== userId) {
      throw new PaymentServiceError(
        "You are not authorized to access this order.",
        403,
        "ORDER_ACCESS_DENIED",
      );
    }

    // 3. Verify Razorpay order ID
    if (!order.razorpayOrderId) {
      throw new PaymentServiceError(
        "Razorpay order ID is missing.",
        409,
        "RAZORPAY_ORDER_MISSING",
      );
    }

    // 4. Verify payment directly with Razorpay
    await this.fetchVerifiedPayment(
      order.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      this.toPaise(order.amount),
    );

    // 5. Save successful payment
    const payment = await this.saveSuccessfulPayment(
      order.id,
      order.userId,
      order.amount,
      razorpayPaymentId,
      razorpaySignature,
    );

    // 6. Update order
    await this.ensureOrderPaid(order);

    // 7. Ensure enrollment
    await this.ensureEnrollment(order.userId, order.batchId, order.id);

    return {
      success: true,
      message: "Payment verified and enrollment synchronized successfully.",
      payment,
    };
  }

  // ------------------------------------------------
  // 10. Handle Failed Payment
  // ------------------------------------------------

  async handleFailedPayment(
    orderId: string,
    userId: string,
    errorReason?: string,
  ): Promise<FailedPaymentResult> {
    this.validateRequiredString(orderId, "Order ID");
    this.validateRequiredString(userId, "User ID");

    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      throw new PaymentServiceError("Order not found.", 404, "ORDER_NOT_FOUND");
    }

    if (order.userId !== userId) {
      throw new PaymentServiceError(
        "You are not authorized to access this order.",
        403,
        "ORDER_ACCESS_DENIED",
      );
    }

    if (order.status === "PAID") {
      throw new PaymentServiceError(
        "A paid order cannot be marked as failed.",
        409,
        "ORDER_ALREADY_PAID",
      );
    }

    if (order.status !== "PENDING") {
      throw new PaymentServiceError(
        "Order is not eligible for payment retries.",
        409,
        "ORDER_NOT_PAYABLE",
      );
    }

    const attempts = await this.paymentRepo.findAllByOrderId(order.id);

    if (attempts.some((attempt) => attempt.status === "SUCCESS")) {
      throw new PaymentServiceError(
        "A successful payment already exists.",
        409,
        "PAYMENT_ALREADY_SUCCESSFUL",
      );
    }

    const latestAttempt = attempts[0];

    if (latestAttempt?.status === "PENDING") {
      const updated = await this.paymentRepo.update(latestAttempt.id, {
        status: "FAILED",
      });

      if (!updated) {
        throw new PaymentServiceError(
          "Failed to record payment failure.",
          500,
          "PAYMENT_UPDATE_FAILED",
        );
      }

      console.warn("[PaymentService] Payment failed:", {
        orderId,
        userId,
        reason: errorReason,
      });

      return {
        success: true,
        message: "Failed payment attempt recorded.",
        payment: updated,
      };
    }

    const payment = await this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      status: "FAILED",
      razorpayPaymentId: null,
      razorpaySignature: null,
    });

    console.warn("[PaymentService] Payment failed:", {
      orderId,
      userId,
      reason: errorReason,
    });

    return {
      success: true,
      message: "Failed payment attempt recorded.",
      payment,
    };
  }

  // ------------------------------------------------
  // 11. Get Payment By Order ID
  // ------------------------------------------------

  async getPaymentByOrderId(orderId: string): Promise<Payment> {
    this.validateRequiredString(orderId, "Order ID");

    const attempts = await this.paymentRepo.findAllByOrderId(orderId);

    const payment =
      attempts.find((item) => item.status === "SUCCESS") ?? attempts[0];

    if (!payment) {
      throw new PaymentServiceError(
        "Payment record not found for this order.",
        404,
        "PAYMENT_NOT_FOUND",
      );
    }

    return payment;
  }
}
