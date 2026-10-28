import { NextRequest, NextResponse } from "next/server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { updateOrderStatusSchema } from "@/validations/academic/order-validation";

const orderService = new OrderService();

const ADMIN_ROLES = new Set(["admin", "manager"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

function jsonError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

function isAdminOrManager(role: string | null | undefined) {
  return ADMIN_ROLES.has(role?.toLowerCase() ?? "");
}

function handleRouteError(error: unknown, operation: string) {
  console.error(`${operation} failed:`, error);

  if (error instanceof Error && error.message === "Order not found.") {
    return jsonError("Order not found.", 404);
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Cannot change order status")
  ) {
    return jsonError(error.message, 409);
  }

  if (
    error instanceof Error &&
    error.message === "Failed to update order status."
  ) {
    return jsonError("Failed to update order status.", 500);
  }

  return jsonError("An unexpected error occurred.", 500);
}

// GET /api/orders/[id]
export async function GET(
  _req: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401);
    }

    const { id } = await params;

    if (!id?.trim()) {
      return jsonError("Order ID is required.", 400);
    }

    const order = await orderService.getOrderById(id.trim());

    if (
      !isAdminOrManager(session.user.role) &&
      order.userId !== session.user.id
    ) {
      return jsonError(
        "You are not authorized to view this order.",
        403,
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: order,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleRouteError(error, "GET /api/orders/[id]");
  }
}

// PATCH /api/orders/[id]
export async function PATCH(
  req: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return jsonError("Authentication required.", 401);
    }

    if (!isAdminOrManager(session.user.role)) {
      return jsonError(
        "You are not authorized to perform this action.",
        403,
      );
    }

    const { id } = await params;

    if (!id?.trim()) {
      return jsonError("Order ID is required.", 400);
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    const validation = updateOrderStatusSchema.safeParse(body);

    if (!validation.success) {
      return jsonError(
        validation.error.issues[0]?.message ??
          "Invalid order status.",
        400,
      );
    }

    const { status } = validation.data;

    if (status === "PAID") {
      return jsonError(
        "Payment status must be updated through verified payment processing.",
        403,
      );
    }

    const updatedOrder = await orderService.updateOrderStatus(
      id.trim(),
      status,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully.",
        data: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    return handleRouteError(error, "PATCH /api/orders/[id]");
  }
}
