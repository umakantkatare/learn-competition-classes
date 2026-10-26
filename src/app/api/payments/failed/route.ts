import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/server/services/academic/payment-service";

const paymentService = new PaymentService();

const failedPaymentSchema = z
  .object({
    orderId: z.string().trim().min(1, "Order ID is required").max(128),
    errorReason: z.string().trim().max(500).optional(),
  })
  .strict();

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

// ==========================================
// POST: Record a Failed Payment Attempt
// ==========================================
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    // 2. Parse JSON safely.
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    // 3. Validate and restrict input.
    const validationResult = failedPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ??
          "Invalid failed-payment data.",
        400,
      );
    }

    const { orderId, errorReason } = validationResult.data;

    // 4. Record the failed attempt.
    // The service MUST verify that the order belongs to this user.
    // Never trust client input to determine payment status.
    const failedPayment = await paymentService.handleFailedPayment(
      orderId,
      session.user.id,
      errorReason,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Failed payment attempt logged.",
        data: failedPayment,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error(
      "[POST /api/payments/failed] Failed to record payment attempt.",
      error,
    );

    return jsonError("Failed to log payment attempt.", 500);
  }
}
