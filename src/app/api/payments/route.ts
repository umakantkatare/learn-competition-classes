import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { PaymentService } from "@/server/services/academic/payment-service";
import { createPaymentSchema } from "@/validations/academic/academic-validations";

const paymentService = new PaymentService();

const jsonError = (message: string, status: number) =>
  NextResponse.json({ success: false, error: message }, { status });

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    const orderId = req.nextUrl.searchParams.get("orderId")?.trim();

    if (!orderId) {
      return jsonError("Please provide an orderId query parameter.", 400);
    }

    if (orderId.length > 128) {
      return jsonError("Invalid orderId.", 400);
    }

    const payment = await paymentService.getPaymentByOrderId(orderId);

    if (!payment) {
      return jsonError("Payment not found.", 404);
    }

    // Admins/managers can access payments for operational purposes.
    // Confirm these role values match your Better Auth configuration.
    const isAdminOrManager =
      session.user.role === "admin" || session.user.role === "manager";

    if (!isAdminOrManager) {
      // Assumes payment.order.userId is available from the service.
      // If not, add a service method that verifies ownership in the DB.
      const paymentWithOrder = payment as typeof payment & {
        order?: { userId?: string };
      };

      if (paymentWithOrder.order?.userId !== session.user.id) {
        return jsonError("Payment not found.", 404);
      }
    }

    return NextResponse.json(
      { success: true, data: payment },
      {
        status: 200,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("[GET /api/payments] Failed to fetch payment.", error);

    return jsonError("Failed to fetch payment details.", 500);
  }
}

// ==========================================
// POST: Create a Pending Payment Attempt
// ==========================================
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return jsonError("Authentication required.", 401);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const validationResult = createPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return jsonError(
        validationResult.error.issues[0]?.message ?? "Invalid payment data.",
        400,
      );
    }

    // Never trust userId, amount, currency, or status from the client.
    // The service must verify order ownership and derive payment values
    // from the order stored in the database.
    const paymentInput = {
      ...validationResult.data,
      userId: session.user.id,
    };

    const newPayment = await paymentService.createPayment(paymentInput);

    return NextResponse.json(
      {
        success: true,
        message: "Payment attempt recorded.",
        data: newPayment,
      },
      {
        status: 201,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("[POST /api/payments] Failed to create payment.", error);

    return jsonError("Failed to create payment record.", 500);
  }
}
