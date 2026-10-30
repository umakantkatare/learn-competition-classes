"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { createOrderSchema } from "@/validations/academic/order-validation";

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

// 1. Create an order for the authenticated user.
// Client should provide batchId only, not userId, amount, or status.
export async function createOrderAction(
  input: Pick<z.infer<typeof createOrderSchema>, "batchId">,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in to purchase.",
      };
    }

    const validatedData = z
      .object({
        batchId: z.string().trim().min(1, "Batch ID is required."),
      })
      .parse(input);

    // Service must derive the price from the database
    // and create a PENDING order for this authenticated user.
    const order = await orderService.createOrder({
      userId: session.user.id,
      batchId: validatedData.batchId,
    } as Parameters<typeof orderService.createOrder>[0]);

    return {
      success: true,
      data: order,
      message: "Order created successfully.",
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 2. Do not expose a client action that changes payment status.
// Payment status must be updated through a verified payment
// verification endpoint or Razorpay webhook.

// 3. Fetch one order only if the user owns it or has admin access.
export async function getOrderByIdAction(id: string): Promise<ActionResult> {
  try {
    if (!id?.trim()) {
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

    const order = await orderService.getOrderById(id);

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
        error: "You are not allowed to access this order.",
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 4. The user ID always comes from the authenticated session.
export async function getUserOrdersAction(): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const orders = await orderService.getUserOrders(session.user.id);

    return {
      success: true,
      data: orders,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

// 5. Razorpay order-ID lookup is for trusted server-side workflows.
// Do not expose it as a public action for arbitrary IDs.
export async function getOrderByRazorpayIdAction(
  razorpayOrderId: string,
): Promise<ActionResult> {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be logged in.",
      };
    }

    const order = await orderService.getOrderByRazorpayId(razorpayOrderId);

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
        error: "You are not allowed to access this order.",
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
