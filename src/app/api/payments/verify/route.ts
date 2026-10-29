import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/server/services/academic/payment-service";
import { verifyRazorpayPaymentSchema } from "@/validations/academic/payment-validation";

const paymentService = new PaymentService();

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

type ErrorResponse = {
  success: false;
  error: string;
  code?: string;
};

class PaymentRouteError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "PaymentRouteError";
  }
}

function jsonError(message: string, status: number, code?: string) {
  const body: ErrorResponse = {
    success: false,
    error: message,
    ...(code ? { code } : {}),
  };

  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function jsonSuccess<T>(data: T, message: string) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status: 200,
      headers: NO_STORE_HEADERS,
    },
  );
}

function handleRouteError(error: unknown) {
  if (error instanceof PaymentRouteError) {
    return jsonError(error.message, error.statusCode, error.code);
  }

  console.error("[POST /api/payments/verify] Unexpected error:", error);

  return jsonError(
    "Payment verification failed. Please try again.",
    500,
    "PAYMENT_VERIFICATION_FAILED",
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user.
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return jsonError("Authentication required.", 401, "UNAUTHENTICATED");
    }

    // 2. Parse the request body.
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400, "INVALID_JSON");
    }

    // 3. Validate request data.
    const validation = verifyRazorpayPaymentSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        validation.error.issues[0]?.message ??
          "Invalid payment verification data.",
        400,
        "VALIDATION_ERROR",
      );
    }

    const { orderId, razorpayPaymentId, razorpaySignature } = validation.data;

    // 4. Verify payment and process enrollment.
    const result = await paymentService.verifyAndProcessPayment(
      orderId,
      razorpayPaymentId,
      razorpaySignature,
      session.user.id,
    );

    // 5. Return a consistent success response.
    return jsonSuccess(result.payment, result.message);
  } catch (error) {
    return handleRouteError(error);
  }
}
