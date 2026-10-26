import { createHmac, timingSafeEqual } from "node:crypto";

import {
  PaymentRepository,
  NewPayment,
} from "@/server/repositories/academic/payment-repository";
import { OrderRepository } from "@/server/repositories/academic/order-repository";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";

export class PaymentService {
  private readonly paymentRepo: PaymentRepository;
  private readonly orderRepo: OrderRepository;
  private readonly enrollmentService: EnrollmentService;

  constructor() {
    this.paymentRepo = new PaymentRepository();
    this.orderRepo = new OrderRepository();
    this.enrollmentService = new EnrollmentService();
  }

  private verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret is not configured.");
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return false;
    }

    const expectedSignature = createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // timingSafeEqual throws when buffer lengths differ.
    const expected = Buffer.from(expectedSignature, "hex");
    const received = Buffer.from(razorpaySignature, "hex");

    return (
      expected.length === received.length && timingSafeEqual(expected, received)
    );
  }

  // 1. Create a payment-attempt record
  async createPayment(data: NewPayment) {
    const order = await this.orderRepo.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status !== "PENDING") {
      throw new Error("Only pending orders can be paid.");
    }

    if (Number(data.amount) !== Number(order.amount)) {
      throw new Error("Payment amount does not match the order amount.");
    }

    // Never trust client-provided userId or payment status.
    const paymentData = {
      ...data,
      userId: order.userId,
      amount: order.amount,
      status: "PENDING",
    } as NewPayment;

    return this.paymentRepo.create(paymentData);
  }

  // 2. Verify payment and enroll the student
  async verifyAndProcessPayment(
    orderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    userId: string,
  ) {
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

    // A verified signature alone does not prove payment capture.
    // Confirm captured/paid status with Razorpay on the server
    // or process a verified payment.captured webhook before marking PAID.

    const existingPayment =
      await this.paymentRepo.findByRazorpayPaymentId(razorpayPaymentId);

    if (existingPayment?.status === "SUCCESS") {
      if (order.status === "PAID") {
        return {
          success: true,
          message: "Payment was already processed.",
          payment: existingPayment,
        };
      }

      throw new Error(
        "Payment is recorded as successful, but the order needs reconciliation.",
      );
    }

    if (order.status === "PAID") {
      throw new Error("Order is already paid.");
    }

    if (order.status !== "PENDING") {
      throw new Error("Order is not eligible for payment processing.");
    }

    // TODO: Before changing the order, fetch payment details from
    // Razorpay and verify the payment is captured and its amount,
    // currency, and order ID match the database order.

    const payment = await this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      razorpayPaymentId,
      razorpaySignature,
      amount: order.amount,
      status: "SUCCESS",
    });

    const updatedOrder = await this.orderRepo.update(order.id, {
      status: "PAID",
    });

    if (!updatedOrder) {
      throw new Error(
        "Payment was recorded, but updating the order failed. Reconciliation is required.",
      );
    }

    await this.enrollmentService.enrollStudent(
      order.userId,
      order.batchId,
      order.id,
    );

    return {
      success: true,
      message: "Payment verified and enrollment processed.",
      payment,
    };
  }

  // 3. Record a failed payment attempt
  async handleFailedPayment(
    orderId: string,
    userId: string,
    errorReason: string | undefined,
  ) {
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

    // Record the failed attempt without prematurely failing the order.
    // errorReason can be logged server-side, but don't trust client text.
    void errorReason;

    return this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      status: "FAILED",
    });
  }

  // 4. Get payment details by order ID
  async getPaymentByOrderId(orderId: string) {
    const payment = await this.paymentRepo.findByOrderId(orderId);

    if (!payment) {
      throw new Error("Payment record not found for this order.");
    }

    return payment;
  }
}
