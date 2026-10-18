
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/verify-jwt";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { payload } = await verifyJWT(token);

    if (typeof payload.sub !== "string") {
      return NextResponse.json(
        { error: "Invalid token claims" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}
