"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { PaymentService } from "@/server/services/academic/payment-service";
import { verifyRazorpayPaymentSchema } from "@/validations/academic/academic-validations";

const paymentService = new PaymentService();
const orderService = new OrderService();

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function requireAdminOrManager(): Promise<boolean> {
  const session = await getSession();

  return ["ADMIN", "MANAGER"].includes(session?.user?.role ?? "");
}

// 1. Payment records should be created by the trusted payment
// processing service, not from arbitrary client-provided data.
export async function createPaymentAction(): Promise<ActionResult> {
  return {
    success: false,
    error:
      "Payment records are created by the verified payment processing flow.",
  };
}

// 2. Verify a Razorpay payment for an order owned by the user.
export async function verifyRazorpayPaymentAction(
  input: z.infer<typeof verifyRazorpayPaymentSchema>,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to verify this payment.",
      };
    }

    const validatedData = verifyRazorpayPaymentSchema.parse(input);

    const order = await orderService.getOrderById(validatedData.orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    const isOwner = order.userId === session.user.id;
    const isPrivileged = await requireAdminOrManager();

    if (!isOwner && !isPrivileged) {
      return {
        success: false,
        error: "You are not allowed to verify this order.",
      };
    }

    // The service must verify the Razorpay signature AND confirm
    // the actual payment status, amount, currency, and order ID
    // with Razorpay before updating records or creating enrollment.
    const result = await paymentService.verifyAndProcessPayment(
      validatedData.orderId,
      validatedData.razorpayPaymentId,
      validatedData.razorpaySignature,
    );

    revalidatePath("/dashboard/my-courses");
    revalidatePath("/dashboard/purchases");

    return {
      success: true,
      data: result.payment,
      message: "Payment verification completed.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 3. Do not let the browser decide that a payment failed.
// Failed/cancelled payments should be reconciled by a trusted
// server-side verification flow or Razorpay webhook.
export async function handleFailedPaymentAction(): Promise<ActionResult> {
  return {
    success: false,
    error:
      "Payment failure must be processed by the trusted server-side payment flow.",
  };
}

// 4. Fetch payment details only for the order owner or an
// authorized admin/manager.
export async function getPaymentByOrderIdAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    if (!orderId?.trim()) {
      return {
        success: false,
        error: "Order ID is required.",
      };
    }

    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    const isOwner = order.userId === session.user.id;
    const isPrivileged = await requireAdminOrManager();

    if (!isOwner && !isPrivileged) {
      return {
        success: false,
        error: "You are not allowed to access this payment.",
      };
    }

    const payment = await paymentService.getPaymentByOrderId(orderId);

    return {
      success: true,
      data: payment,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
