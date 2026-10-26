import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { OrderService } from "@/server/services/academic/order-service";
import { createOrderSchema } from "@/validations/academic/academic-validations";

const orderService = new OrderService();

// GET: Fetch the authenticated user's orders
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = searchParams.get("userId");

    // Users cannot fetch another user's orders.
    // ADMIN/MANAGER may query another user if explicitly requested.
    const role = session.user.role ?? "";
    const isAdminOrManager = ["admin", "manager"].includes(role);

    if (
      requestedUserId &&
      requestedUserId !== session.user.id &&
      !isAdminOrManager
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to view these orders.",
        },
        { status: 403 },
      );
    }

    const userId = requestedUserId || session.user.id;
    const orders = await orderService.getUserOrders(userId);

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}

// POST: Create a pending order for the authenticated user
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 },
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

    const validationResult = createOrderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message ?? "Invalid order data.",
        },
        { status: 400 },
      );
    }

    // Use the authenticated user's ID rather than trusting a client-supplied userId.
    // This assumes createOrder accepts an input containing userId.
    const newOrder = await orderService.createOrder({
      ...validationResult.data,
      userId: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        data: newOrder,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create order." },
      { status: 500 },
    );
  }
}
