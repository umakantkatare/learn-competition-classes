import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPPORTED_EVENTS = new Set([
  "payment.captured",
  "payment.failed",
  "order.paid",
]);

function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Reject malformed signatures before comparing them.
  if (
    !/^[a-fA-F0-9]{64}$/.test(signature) ||
    !/^[a-fA-F0-9]{64}$/.test(expectedSignature)
  ) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(signature, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Razorpay webhook secret is not configured.");

    return NextResponse.json(
      { success: false, error: "Webhook is not configured." },
      { status: 500 },
    );
  }

  // Signature verification must use the exact, unmodified request body.
  const rawBody = await req.text();

  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json(
      { success: false, error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let event: {
    event?: string;
    payload?: Record<string, unknown>;
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid webhook JSON." },
      { status: 400 },
    );
  }

  if (typeof event.event !== "string") {
    return NextResponse.json(
      { success: false, error: "Missing webhook event type." },
      { status: 400 },
    );
  }

  // Unknown events can be acknowledged without changing payment state.
  if (!SUPPORTED_EVENTS.has(event.event)) {
    return NextResponse.json({
      success: true,
      message: "Event ignored.",
    });
  }

  /*
   * IMPORTANT:
   * Signature verification authenticates the webhook payload, but it does
   * not make event processing idempotent.
   *
   * Before enabling payment processing, connect these events to a
   * transactional service that:
   * 1. Deduplicates events using Razorpay's event ID.
   * 2. Matches the Razorpay order to the local order.
   * 3. Validates amount, currency and payment status.
   * 4. Prevents failed events from overriding successful payments.
   * 5. Activates enrollment only after verified successful payment.
   */

  console.info("Verified Razorpay webhook received:", event.event);

  return NextResponse.json({
    success: true,
    message: "Webhook signature verified.",
  });
}
