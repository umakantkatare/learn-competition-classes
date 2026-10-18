import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/admin", "/manager", "/teacher", "/student"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isDashboardRoute) {
    return NextResponse.next();
  }

  const hasSessionCookie =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token");

  if (!hasSessionCookie) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/manager/:path*",
    "/teacher/:path*",
    "/student/:path*",
  ],
};
