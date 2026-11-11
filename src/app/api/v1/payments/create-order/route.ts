import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { createOrderRequestSchema } from "@/validations/academic/order-validation";

export const runtime = "nodejs";

const orderService = new OrderService();

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

// POST /api/payments/create-order
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401);
    }

    // 2. Parse request body
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    // 3. Validate request
    const validation = createOrderRequestSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        validation.error.issues[0]?.message ?? "Invalid order data.",
        400,
      );
    }

    // 4. Create local order + Razorpay order
    const order = await orderService.createOrder({
      userId: session.user.id,
      batchId: validation.data.batchId,
    });

    // 5. Return checkout details
    return NextResponse.json(
      {
        success: true,
        message: "Razorpay order created successfully.",
        data: {
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          amount: order.amount,
          currency: order.currency,
          keyId: order.keyId,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error: unknown) {
    console.error("POST /api/payments/create-order failed:", error);

    if (error instanceof ZodError) {
      return jsonError(
        error.issues[0]?.message ?? "Invalid request data.",
        400,
      );
    }

    return jsonError(
      error instanceof Error
        ? error.message
        : "Unable to create payment order.",
      500,
    );
  }
}
