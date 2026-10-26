import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/server/services/academic/payment-service";
import { verifyRazorpayPaymentSchema } from "@/validations/academic/academic-validations";

const paymentService = new PaymentService();

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { success: false, error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

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

    // 3. Validate the Razorpay verification payload.
    const validationResult = verifyRazorpayPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ??
          "Invalid payment verification data.",
        400,
      );
    }

    const { orderId, razorpayPaymentId, razorpaySignature } =
      validationResult.data;

    // 4. Verify the payment and process enrollment.
    // The service MUST verify order ownership, the Razorpay signature,
    // payment status, amount, currency, and duplicate processing.
    const result = await paymentService.verifyAndProcessPayment(
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      session.user.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.payment,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    // Keep internal errors in server logs only.
    console.error(
      "[POST /api/payments/verify] Payment verification failed.",
      error,
    );

    // Map known business errors to client responses.
    // Adapt these patterns to the actual service error messages.
    const message = error instanceof Error ? error.message : "";

    if (/invalid signature|invalid payment signature/i.test(message)) {
      return jsonError("Payment signature verification failed.", 400);
    }

    if (/order not found|payment not found/i.test(message)) {
      return jsonError("Order or payment not found.", 404);
    }

    if (/does not belong|unauthorized order|order ownership/i.test(message)) {
      return jsonError("You are not authorized to verify this order.", 403);
    }

    if (
      /amount mismatch|currency mismatch|payment not captured/i.test(message)
    ) {
      return jsonError("Payment details could not be verified.", 400);
    }

    return jsonError("Payment verification failed. Please try again.", 500);
  }
}
