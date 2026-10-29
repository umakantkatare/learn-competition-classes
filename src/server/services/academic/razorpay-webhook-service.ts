import "server-only";

import { razorpay } from "@/lib/razorpay";
import {
  PaymentRepository,
  type Payment,
} from "@/server/repositories/academic/payment-repository";
import { OrderRepository } from "@/server/repositories/academic/order-repository";
import { EnrollmentService } from "@/server/services/academic/enrollment-service";

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

interface ProcessWebhookEventInput {
  eventId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}

interface ProcessWebhookEventResult {
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
  ) {}

  async processEvent(
    input: ProcessWebhookEventInput,
  ): Promise<ProcessWebhookEventResult> {
    this.validateInput(input);

    const payload = input.payload as RazorpayWebhookPayload | undefined;

    switch (input.eventType as RazorpayWebhookEventType) {
      case "payment.captured": {
        const payment = payload?.payment?.entity;

        if (!payment) {
          throw new RazorpayWebhookError(
            "Payment entity is missing.",
            400,
            "PAYMENT_ENTITY_MISSING",
          );
        }

        await this.processCapturedPayment(payment);

        return {
          success: true,
          message: "Captured payment processed.",
        };
      }

      case "payment.failed": {
        const payment = payload?.payment?.entity;

        if (!payment) {
          throw new RazorpayWebhookError(
            "Payment entity is missing.",
            400,
            "PAYMENT_ENTITY_MISSING",
          );
        }

        await this.processFailedPayment(payment);

        return {
          success: true,
          message: "Failed payment event processed.",
        };
      }

      case "order.paid": {
        const order = payload?.order?.entity;

        if (!order) {
          throw new RazorpayWebhookError(
            "Order entity is missing.",
            400,
            "ORDER_ENTITY_MISSING",
          );
        }

        await this.processPaidOrder(order);

        return {
          success: true,
          message: "Paid order event processed.",
        };
      }

      default:
        return {
          success: true,
          message: "Unsupported event ignored.",
        };
    }
  }

  private validateInput(input: ProcessWebhookEventInput): void {
    if (!input.eventId?.trim()) {
      throw new RazorpayWebhookError(
        "Webhook event ID is required.",
        400,
        "EVENT_ID_REQUIRED",
      );
    }

    if (!input.eventType?.trim()) {
      throw new RazorpayWebhookError(
        "Webhook event type is required.",
        400,
        "EVENT_TYPE_REQUIRED",
      );
    }
  }

  private async processCapturedPayment(
    payment: RazorpayPaymentEntity,
  ): Promise<void> {
    if (
      !payment.id ||
      !payment.order_id ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
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

    // Fetch the payment from Razorpay rather than relying
    // exclusively on the webhook payload.
    const verifiedPayment = await razorpay.payments.fetch(payment.id);

    if (
      verifiedPayment.id !== payment.id ||
      verifiedPayment.order_id !== payment.order_id ||
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

    const order = await this.orderRepo.findByRazorpayOrderId(payment.order_id);

    if (!order) {
      throw new RazorpayWebhookError(
        "Local order was not found.",
        404,
        "ORDER_NOT_FOUND",
      );
    }

    const expectedAmount = this.toPaise(order.amount);

    if (
      expectedAmount !== payment.amount ||
      order.razorpayOrderId !== payment.order_id
    ) {
      throw new RazorpayWebhookError(
        "Payment amount does not match the local order.",
        400,
        "PAYMENT_AMOUNT_MISMATCH",
      );
    }

    const existingPayment = await this.paymentRepo.findByRazorpayPaymentId(
      payment.id,
    );

    if (existingPayment) {
      this.assertPaymentMatchesOrder(existingPayment, order);

      if (existingPayment.status === "SUCCESS") {
        // Retry enrollment if payment/order processing succeeded
        // earlier but enrollment activation failed.
        await this.ensureEnrollment(order);

        return;
      }
    } else {
      // The order may already be paid by a different payment.
      if (order.status === "PAID") {
        throw new RazorpayWebhookError(
          "Order is already paid by another payment.",
          409,
          "ORDER_ALREADY_PAID",
        );
      }
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
      throw new Error("Failed to persist the successful payment.");
    }

    if (order.status !== "PAID") {
      const updatedOrder = await this.orderRepo.update(order.id, {
        status: "PAID",
      });

      if (!updatedOrder) {
        throw new Error("Payment saved, but the order update failed.");
      }
    }

    await this.ensureEnrollment(order);
  }

  private async processFailedPayment(
    payment: RazorpayPaymentEntity,
  ): Promise<void> {
    if (
      !payment.id ||
      !payment.order_id ||
      !Number.isSafeInteger(payment.amount) ||
      payment.amount <= 0 ||
      payment.currency !== "INR" ||
      payment.status !== "failed"
    ) {
      throw new RazorpayWebhookError(
        "Failed payment details are invalid.",
        400,
        "INVALID_FAILED_PAYMENT",
      );
    }

    const order = await this.orderRepo.findByRazorpayOrderId(payment.order_id);

    if (!order) {
      throw new RazorpayWebhookError(
        "Local order was not found.",
        404,
        "ORDER_NOT_FOUND",
      );
    }

    if (this.toPaise(order.amount) !== payment.amount) {
      throw new RazorpayWebhookError(
        "Payment amount does not match the local order.",
        400,
        "PAYMENT_AMOUNT_MISMATCH",
      );
    }

    const existingPayment = await this.paymentRepo.findByRazorpayPaymentId(
      payment.id,
    );

    if (existingPayment) {
      this.assertPaymentMatchesOrder(existingPayment, order);

      // A late failed event must never downgrade a successful payment.
      if (existingPayment.status === "SUCCESS") {
        return;
      }

      // A duplicate failed event must not create another record.
      return;
    }

    // Client-reported failure details are not used here.
    // Only the signed webhook payload is being processed.
    await this.paymentRepo.create({
      orderId: order.id,
      userId: order.userId,
      razorpayPaymentId: payment.id,
      razorpaySignature: null,
      amount: order.amount,
      status: "FAILED",
    });
  }

  private async processPaidOrder(
    razorpayOrder: RazorpayOrderEntity,
  ): Promise<void> {
    if (
      !razorpayOrder.id ||
      !Number.isSafeInteger(razorpayOrder.amount) ||
      razorpayOrder.amount <= 0 ||
      razorpayOrder.currency !== "INR" ||
      razorpayOrder.status !== "paid"
    ) {
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

    if (this.toPaise(order.amount) !== razorpayOrder.amount) {
      throw new RazorpayWebhookError(
        "Order amount does not match the local order.",
        400,
        "ORDER_AMOUNT_MISMATCH",
      );
    }

    /*
     * An order.paid event does not, by itself, identify which payment
     * should be stored in the local payments table.
     *
     * Fetch the provider's payments and process a captured payment
     * through the same verification path.
     */
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

  private assertPaymentMatchesOrder(
    payment: Payment,
    order: {
      id: string;
      userId: string;
    },
  ): void {
    if (payment.orderId !== order.id || payment.userId !== order.userId) {
      throw new RazorpayWebhookError(
        "Payment record does not match the order.",
        409,
        "PAYMENT_ORDER_MISMATCH",
      );
    }
  }

  private async ensureEnrollment(order: {
    id: string;
    userId: string;
    batchId: string;
  }): Promise<void> {
    const hasAccess = await this.enrollmentService.hasValidAccess(
      order.userId,
      order.batchId,
    );

    if (!hasAccess) {
      await this.enrollmentService.enrollStudent(
        order.userId,
        order.batchId,
        order.id,
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
