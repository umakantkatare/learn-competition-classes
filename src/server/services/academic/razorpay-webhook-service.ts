import "server-only";

import { razorpay } from "@/lib/razorpay";

import {
  PaymentRepository,
  type Payment,
} from "@/server/repositories/academic/payment-repository";

import { OrderRepository } from "@/server/repositories/academic/order-repository";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";
import { WebhookEventRepository } from "@/server/repositories/academic/webhook-event-repository";

type RazorpayWebhookEventType =
  "payment.captured" | "payment.failed" | "order.paid";

interface RazorpayPaymentEntity {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  captured?: boolean;
  error_description?: string | null;
}

interface RazorpayOrderEntity {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayWebhookPayload {
  payment?: {
    entity?: RazorpayPaymentEntity;
  };
  order?: {
    entity?: RazorpayOrderEntity;
  };
}

export interface ProcessWebhookEventInput {
  eventId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}

export interface ProcessWebhookEventResult {
  success: true;
  message: string;
  duplicate?: boolean;
}

export class RazorpayWebhookError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "RazorpayWebhookError";
  }
}

export class RazorpayWebhookService {
  constructor(
    private readonly paymentRepo = new PaymentRepository(),
    private readonly orderRepo = new OrderRepository(),
    private readonly enrollmentService = new EnrollmentService(),
    private readonly webhookEventRepo = new WebhookEventRepository(),
  ) {}

  // ---------------------------------------------------------------------------
  // Event processing and idempotency
  // ---------------------------------------------------------------------------

  async processEvent(
    input: ProcessWebhookEventInput,
  ): Promise<ProcessWebhookEventResult> {
    this.validateInput(input);

    const claim = await this.webhookEventRepo.claimEvent({
      eventId: input.eventId,
      eventType: input.eventType,
      payload: input.payload,
    });

    if (!claim.claimed) {
      return {
        success: true,
        message:
          claim.event?.status === "PROCESSED"
            ? "Webhook event was already processed."
            : "Webhook event is already being processed.",
        duplicate: true,
      };
    }

    try {
      const payload = input.payload as RazorpayWebhookPayload | undefined;

      switch (input.eventType as RazorpayWebhookEventType) {
        case "payment.captured": {
          const payment = payload?.payment?.entity;

          this.validatePaymentEntity(payment);
          await this.processCapturedPayment(payment);
          break;
        }

        case "payment.failed": {
          const payment = payload?.payment?.entity;

          this.validatePaymentEntity(payment);
          await this.processFailedPayment(payment);
          break;
        }

        case "order.paid": {
          const order = payload?.order?.entity;

          this.validateOrderEntity(order);
          await this.processPaidOrder(order);
          break;
        }

        default: {
          // Unknown event types are acknowledged and marked processed.
          break;
        }
      }

      const processed = await this.webhookEventRepo.markProcessed(
        input.eventId,
      );

      if (!processed) {
        throw new Error("Failed to mark webhook event as processed.");
      }

      return {
        success: true,
        message: "Webhook event processed successfully.",
      };
    } catch (error) {
      try {
        await this.webhookEventRepo.markFailed(
          input.eventId,
          error instanceof Error
            ? error.message
            : "Unknown webhook processing error.",
        );
      } catch (markError) {
        console.error("[RAZORPAY_WEBHOOK_MARK_FAILED_ERROR]", markError);
      }

      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Input validation
  // ---------------------------------------------------------------------------

  private validateInput(input: ProcessWebhookEventInput): void {
    if (!input || typeof input !== "object") {
      throw new RazorpayWebhookError(
        "Invalid webhook input.",
        400,
        "INVALID_WEBHOOK_INPUT",
      );
    }

    if (typeof input.eventId !== "string" || !input.eventId.trim()) {
      throw new RazorpayWebhookError(
        "Webhook event ID is required.",
        400,
        "EVENT_ID_REQUIRED",
      );
    }

    if (typeof input.eventType !== "string" || !input.eventType.trim()) {
      throw new RazorpayWebhookError(
        "Webhook event type is required.",
        400,
        "EVENT_TYPE_REQUIRED",
      );
    }
  }

  private validatePaymentEntity(
    payment: RazorpayPaymentEntity | undefined,
  ): asserts payment is RazorpayPaymentEntity {
    if (
      !payment ||
      typeof payment.id !== "string" ||
      !payment.id.trim() ||
      typeof payment.order_id !== "string" ||
      !payment.order_id.trim() ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
      typeof payment.currency !== "string" ||
      typeof payment.status !== "string"
    ) {
      throw new RazorpayWebhookError(
        "Invalid payment entity in webhook payload.",
        400,
        "INVALID_PAYMENT_ENTITY",
      );
    }
  }

  private validateOrderEntity(
    order: RazorpayOrderEntity | undefined,
  ): asserts order is RazorpayOrderEntity {
    if (
      !order ||
      typeof order.id !== "string" ||
      !order.id.trim() ||
      !Number.isSafeInteger(order.amount) ||
      order.amount <= 0 ||
      typeof order.currency !== "string" ||
      typeof order.status !== "string"
    ) {
      throw new RazorpayWebhookError(
        "Invalid order entity in webhook payload.",
        400,
        "INVALID_ORDER_ENTITY",
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Captured payment
  // ---------------------------------------------------------------------------

  private async processCapturedPayment(
    payment: RazorpayPaymentEntity,
  ): Promise<void> {
    const razorpayOrderId = payment.order_id;

    if (
      !razorpayOrderId ||
      payment.currency !== "INR" ||
      payment.status !== "captured" ||
      payment.captured !== true
    ) {
      throw new RazorpayWebhookError(
        "Captured payment details are invalid.",
        400,
        "INVALID_CAPTURED_PAYMENT",
      );
    }

    // Verify the payment directly with Razorpay.
    const verifiedPayment = await razorpay.payments.fetch(payment.id);

    if (
      verifiedPayment.id !== payment.id ||
      verifiedPayment.order_id !== razorpayOrderId ||
      verifiedPayment.amount !== payment.amount ||
      verifiedPayment.currency !== "INR" ||
      verifiedPayment.status !== "captured" ||
      verifiedPayment.captured !== true
    ) {
      throw new RazorpayWebhookError(
        "Payment verification failed.",
        400,
        "PAYMENT_VERIFICATION_FAILED",
      );
    }

    const order = await this.orderRepo.findByRazorpayOrderId(razorpayOrderId);

    if (!order) {
      throw new RazorpayWebhookError(
        "Local order was not found.",
        404,
        "ORDER_NOT_FOUND",
      );
    }

    this.validatePaymentAmount(payment.amount, order.amount);

    if (order.razorpayOrderId !== razorpayOrderId) {
      throw new RazorpayWebhookError(
        "Razorpay order ID does not match the local order.",
        409,
        "RAZORPAY_ORDER_MISMATCH",
      );
    }

    const existingPayment = await this.paymentRepo.findByRazorpayPaymentId(
      payment.id,
    );

    if (existingPayment) {
      this.assertPaymentMatchesOrder(existingPayment, order);
      this.assertStoredPaymentAmount(existingPayment, order.amount);

      if (existingPayment.status === "SUCCESS") {
        // Recover from a previous partial failure:
        // payment saved, but order or enrollment update failed.
        await this.ensureOrderPaid(order);
        await this.ensureEnrollment(order);
        return;
      }
    }

    // A separate captured payment against an already-paid order
    // is a duplicate charge. Record it for refund reconciliation.
    if (order.status === "PAID" && !existingPayment) {
      const duplicatePayment = await this.paymentRepo.create({
        orderId: order.id,
        userId: order.userId,
        razorpayPaymentId: payment.id,
        razorpaySignature: null,
        amount: order.amount,
        status: "SUCCESS",
      });

      if (!duplicatePayment) {
        throw new Error("Failed to record duplicate captured payment.");
      }

      console.error("[RAZORPAY_DUPLICATE_CAPTURE]", {
        orderId: order.id,
        razorpayOrderId,
        razorpayPaymentId: payment.id,
        amount: payment.amount,
        actionRequired: "REFUND_RECONCILIATION",
      });

      // Do not enroll twice. A refund/reconciliation workflow
      // must handle this captured payment separately.
      return;
    }

    if (order.status !== "PENDING" && order.status !== "PAID") {
      throw new RazorpayWebhookError(
        "Order is not eligible for payment processing.",
        409,
        "ORDER_NOT_PAYABLE",
      );
    }

    let savedPayment: Payment | undefined;

    if (existingPayment) {
      savedPayment = await this.paymentRepo.update(existingPayment.id, {
        status: "SUCCESS",
        amount: order.amount,
      });
    } else {
      savedPayment = await this.paymentRepo.create({
        orderId: order.id,
        userId: order.userId,
        razorpayPaymentId: payment.id,
        razorpaySignature: null,
        amount: order.amount,
        status: "SUCCESS",
      });
    }

    if (!savedPayment) {
      throw new Error("Failed to persist successful payment.");
    }

    await this.ensureOrderPaid(order);
    await this.ensureEnrollment(order);
  }

  // ---------------------------------------------------------------------------
  // Failed payment
  // ---------------------------------------------------------------------------

  private async processFailedPayment(
    payment: RazorpayPaymentEntity,
  ): Promise<void> {
    const razorpayOrderId = payment.order_id;

    if (
      !razorpayOrderId ||
      payment.currency !== "INR" ||
      payment.status !== "failed"
    ) {
      throw new RazorpayWebhookError(
        "Failed payment details are invalid.",
        400,
        "INVALID_FAILED_PAYMENT",
      );
    }

    const order = await this.orderRepo.findByRazorpayOrderId(razorpayOrderId);

    if (!order) {
      throw new RazorpayWebhookError(
        "Local order was not found.",
        404,
        "ORDER_NOT_FOUND",
      );
    }

    this.validatePaymentAmount(payment.amount, order.amount);

    const existingPayment = await this.paymentRepo.findByRazorpayPaymentId(
      payment.id,
    );

    if (existingPayment) {
      this.assertPaymentMatchesOrder(existingPayment, order);

      // Never downgrade a successful payment.
      // A duplicate failed event must not create another record.
      return;
    }

    // A late failure event must not create a failed record
    // after another payment has paid this order.
    if (order.status !== "PENDING") {
      return;
    }

    const failedPayment = await this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      razorpayPaymentId: payment.id,
      razorpaySignature: null,
      amount: order.amount,
      status: "FAILED",
    });

    if (!failedPayment) {
      throw new Error("Failed to persist failed payment.");
    }
  }

  // ---------------------------------------------------------------------------
  // Paid order reconciliation
  // ---------------------------------------------------------------------------

  private async processPaidOrder(
    razorpayOrder: RazorpayOrderEntity,
  ): Promise<void> {
    if (razorpayOrder.currency !== "INR" || razorpayOrder.status !== "paid") {
      throw new RazorpayWebhookError(
        "Paid order details are invalid.",
        400,
        "INVALID_PAID_ORDER",
      );
    }

    const order = await this.orderRepo.findByRazorpayOrderId(razorpayOrder.id);

    if (!order) {
      throw new RazorpayWebhookError(
        "Local order was not found.",
        404,
        "ORDER_NOT_FOUND",
      );
    }

    this.validatePaymentAmount(razorpayOrder.amount, order.amount);

    // The order.paid event does not identify a specific payment.
    // Fetch provider payments and reconcile captured payments.
    const result = await razorpay.orders.fetchPayments(razorpayOrder.id);

    const capturedPayments = result.items.filter(
      (item) => item.status === "captured" && item.captured === true,
    );

    if (capturedPayments.length === 0) {
      throw new Error(
        "Paid order has no captured payment available for reconciliation.",
      );
    }

    for (const item of capturedPayments) {
      const payment = await razorpay.payments.fetch(item.id);

      if (
        payment.order_id !== razorpayOrder.id ||
        payment.amount !== razorpayOrder.amount ||
        payment.currency !== "INR" ||
        payment.status !== "captured" ||
        payment.captured !== true
      ) {
        throw new RazorpayWebhookError(
          "Captured payment does not match the paid order.",
          400,
          "ORDER_PAYMENT_MISMATCH",
        );
      }

      await this.processCapturedPayment({
        id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        captured: payment.captured,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Order reconciliation
  // ---------------------------------------------------------------------------

  private async ensureOrderPaid(order: {
    id: string;
    status: string;
  }): Promise<void> {
    if (order.status === "PAID") {
      return;
    }

    if (order.status !== "PENDING") {
      throw new RazorpayWebhookError(
        "Order cannot be marked as paid.",
        409,
        "ORDER_NOT_PAYABLE",
      );
    }

    const updatedOrder = await this.orderRepo.update(order.id, {
      status: "PAID",
    });

    if (!updatedOrder) {
      throw new Error("Payment was saved, but order status update failed.");
    }
  }

  // ---------------------------------------------------------------------------
  // Enrollment reconciliation
  // ---------------------------------------------------------------------------

  private async ensureEnrollment(order: {
    id: string;
    userId: string;
    batchId: string;
  }): Promise<void> {
    const hasAccess = await this.enrollmentService.hasValidAccess(
      order.userId,
      order.batchId,
    );

    if (hasAccess) {
      return;
    }

    await this.enrollmentService.enrollStudent(
      order.userId,
      order.batchId,
      order.id,
    );
  }

  // ---------------------------------------------------------------------------
  // Consistency validation
  // ---------------------------------------------------------------------------

  private assertPaymentMatchesOrder(
    payment: Payment,
    order: {
      id: string;
      userId: string;
    },
  ): void {
    if (payment.orderId !== order.id || payment.userId !== order.userId) {
      throw new RazorpayWebhookError(
        "Payment record does not match the local order.",
        409,
        "PAYMENT_ORDER_MISMATCH",
      );
    }
  }

  private assertStoredPaymentAmount(
    payment: Payment,
    orderAmount: string | number,
  ): void {
    if (Number(payment.amount) !== Number(orderAmount)) {
      throw new RazorpayWebhookError(
        "Stored payment amount does not match the order.",
        409,
        "EXISTING_PAYMENT_AMOUNT_MISMATCH",
      );
    }
  }

  private validatePaymentAmount(
    receivedAmount: number,
    orderAmount: string | number,
  ): void {
    const expectedAmount = this.toPaise(orderAmount);

    if (receivedAmount !== expectedAmount) {
      throw new RazorpayWebhookError(
        "Payment amount does not match the local order.",
        400,
        "PAYMENT_AMOUNT_MISMATCH",
      );
    }
  }

  private toPaise(amount: string | number): number {
    const value = String(amount);

    if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
      throw new RazorpayWebhookError(
        "Invalid order amount.",
        400,
        "INVALID_ORDER_AMOUNT",
      );
    }

    const [rupees, fraction = ""] = value.split(".");

    const paise = Number(rupees) * 100 + Number(fraction.padEnd(2, "0"));

    if (!Number.isSafeInteger(paise) || paise <= 0) {
      throw new RazorpayWebhookError(
        "Invalid order amount.",
        400,
        "INVALID_ORDER_AMOUNT",
      );
    }

    return paise;
  }
}
