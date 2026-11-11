import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import {
  RazorpayWebhookError,
  RazorpayWebhookService,
} from "@/server/services/academic/razorpay-webhook-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const webhookService = new RazorpayWebhookService();

const SUPPORTED_EVENTS = new Set([
  "payment.captured",
  "payment.failed",
  "order.paid",
]);

interface RazorpayWebhookRequest {
  event?: string;
  payload?: Record<string, unknown>;
}

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (
    !/^[a-fA-F0-9]{64}$/.test(signature) ||
    !/^[a-fA-F0-9]{64}$/.test(expectedSignature)
  ) {
    return false;
  }

  const expected = Buffer.from(expectedSignature, "hex");
  const received = Buffer.from(signature, "hex");

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("[RAZORPAY_WEBHOOK] Missing RAZORPAY_WEBHOOK_SECRET");

      return NextResponse.json(
        {
          success: false,
          message: "Webhook configuration error.",
        },
        { status: 500 },
      );
    }

    // Read the raw body before parsing JSON.
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          message: "Empty webhook payload.",
        },
        { status: 400 },
      );
    }

    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook signature.",
        },
        { status: 401 },
      );
    }

    let event: RazorpayWebhookRequest;

    try {
      event = JSON.parse(rawBody) as RazorpayWebhookRequest;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook JSON payload.",
        },
        { status: 400 },
      );
    }

    if (typeof event.event !== "string" || !event.event.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing webhook event type.",
        },
        { status: 400 },
      );
    }

    // Acknowledge unsupported events without processing them.
    if (!SUPPORTED_EVENTS.has(event.event)) {
      return NextResponse.json({
        success: true,
        message: `Ignored event: ${event.event}`,
      });
    }

    const eventId = request.headers.get("x-razorpay-event-id");

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing Razorpay event ID.",
        },
        { status: 400 },
      );
    }

    const result = await webhookService.processEvent({
      eventId,
      eventType: event.event,
      payload: event.payload,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[RAZORPAY_WEBHOOK_ERROR]", error);

    if (error instanceof RazorpayWebhookError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: error.statusCode },
      );
    }

    // A 500 response allows Razorpay to retry processing.
    return NextResponse.json(
      {
        success: false,
        message: "Webhook processing failed.",
      },
      { status: 500 },
    );
  }
}
