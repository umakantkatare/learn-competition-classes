import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { updateOrderStatusSchema } from "@/validations/academic/academic-validations";

const orderService = new OrderService();

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

// GET: Fetch an order by database ID
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 },
      );
    }

    const order = await orderService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }

    // Users may access only their own orders.
    // ADMIN/MANAGER may access orders for administrative purposes.
    const role = session.user.role ?? "";
    const isAdminOrManager = ["ADMIN", "MANAGER"].includes(role);

    if (!isAdminOrManager && order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to view this order." },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/orders/[id] error:", error);

    if (error instanceof Error && error.message === "Order not found.") {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to fetch order." },
      { status: 500 },
    );
  }
}

// PATCH: Update an order status — ADMIN/MANAGER only.
// Payment-related transitions must be handled by the verified payment workflow.
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const role = session.user.role ?? "";

    if (!["admin", "manager"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to perform this action.",
        },
        { status: 403 },
      );
    }

    const { id } = await params;

    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const validationResult = updateOrderStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ??
            "Invalid order status.",
        },
        { status: 400 },
      );
    }

    // Do not permit manual payment-success transitions.
    if (validationResult.data.status === "PAID") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order payment status must be updated through verified payment processing.",
        },
        { status: 400 },
      );
    }

    const updatedOrder = await orderService.updateOrderStatus(
      id,
      validationResult.data.status,
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order status updated successfully.",
        data: updatedOrder,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("PATCH /api/orders/[id] error:", error);

    if (error instanceof Error && error.message === "Order not found.") {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update order status." },
      { status: 500 },
    );
  }
}
