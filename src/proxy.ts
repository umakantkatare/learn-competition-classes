import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/verify-email");

  const isDashboard = pathname.startsWith("/dashboard");

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up", "/verify-email/:path*", "/dashboard/:path*"],
};


