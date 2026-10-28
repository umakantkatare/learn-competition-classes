import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { createOrderRequestSchema } from "@/validations/academic/order-validation";

const orderService = new OrderService();

const ADMIN_ROLES = new Set(["admin", "manager"]);

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function handleError(error: unknown, operation: string) {
  console.error(`${operation} failed:`, error);

  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Invalid request data.", 400);
  }

  return jsonError("An unexpected error occurred.", 500);
}

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401);
    }

    const requestedUserId = req.nextUrl.searchParams.get("userId");

    const role = session.user.role ?? "";
    const isAdminOrManager = ADMIN_ROLES.has(role);

    if (
      requestedUserId &&
      requestedUserId !== session.user.id &&
      !isAdminOrManager
    ) {
      return jsonError("You are not authorized to view these orders.", 403);
    }

    const userId = requestedUserId || session.user.id;

    const orders = await orderService.getUserOrders(userId);

    return NextResponse.json(
      {
        success: true,
        data: orders,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleError(error, "GET /api/orders");
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const validation = createOrderRequestSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        validation.error.issues[0]?.message ?? "Invalid order data.",
        400,
      );
    }

    const order = await orderService.createOrder({
      userId: session.user.id,
      batchId: validation.data.batchId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: order,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleError(error, "POST /api/orders");
  }
}
