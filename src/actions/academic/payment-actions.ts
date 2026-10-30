"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AuthorizationError, getCurrentUser } from "@/lib/authorize";

import { OrderService } from "@/server/services/academic/order-service";
import { PaymentService } from "@/server/services/academic/payment-service";

import { verifyRazorpayPaymentSchema } from "@/validations/academic/payment-validation";

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

  if (error instanceof AuthorizationError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

/**
 * Payment records must only be created through
 * verified payment processing or webhook handling.
 */
export async function createPaymentAction(): Promise<ActionResult> {
  return {
    success: false,
    error:
      "Payment records are created by the verified payment processing flow.",
  };
}

/**
 * Verify Razorpay payment and process enrollment.
 */
export async function verifyRazorpayPaymentAction(
  input: z.infer<typeof verifyRazorpayPaymentSchema>,
): Promise<ActionResult> {
  try {
    // 1. Authenticate the current user.
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to verify this payment.",
      };
    }

    // 2. Validate client input.
    const validatedData = verifyRazorpayPaymentSchema.parse(input);

    // 3. Fetch the order.
    const order = await orderService.getOrderById(validatedData.orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    // 4. Verify order ownership.
    // Only the order owner can initiate payment verification.
    // Privileged support access should be implemented separately
    // if explicitly required by your business rules.
    if (order.userId !== user.id) {
      return {
        success: false,
        error: "You are not allowed to verify this order.",
      };
    }

    // 5. Verify the Razorpay payment and process enrollment.
    const result = await paymentService.verifyAndProcessPayment(
      validatedData.orderId,
      validatedData.razorpayPaymentId,
      validatedData.razorpaySignature,
      user.id,
    );

    // 6. Revalidate relevant dashboard pages.
    revalidatePath("/dashboard/my-courses");
    revalidatePath("/dashboard/purchases");

    return {
      success: true,
      data: result.payment,
      message: result.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * The browser cannot independently declare a payment failed.
 * Failure processing must use trusted server-side verification
 * or a verified webhook.
 */
export async function handleFailedPaymentAction(): Promise<ActionResult> {
  return {
    success: false,
    error:
      "Payment failure must be processed by the trusted server-side payment flow.",
  };
}

/**
 * Retrieve payment details for the order owner.
 */
export async function getPaymentByOrderIdAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    // 1. Validate order ID.
    if (!orderId?.trim()) {
      return {
        success: false,
        error: "Order ID is required.",
      };
    }

    // 2. Authenticate the current user.
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    // 3. Fetch the order.
    const order = await orderService.getOrderById(orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found.",
      };
    }

    // 4. Authorize access.
    if (order.userId !== user.id) {
      return {
        success: false,
        error: "You are not allowed to access this payment.",
      };
    }

    // 5. Fetch the payment.
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
