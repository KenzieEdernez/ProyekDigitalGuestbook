import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
} from "@/lib/admin-auth-constants";

const protectedPaths = ["/admin", "/check-in", "/souvenir", "/staff"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!isProtected || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const isLoggedIn =
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;

  if (isLoggedIn) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/check-in/:path*", "/souvenir/:path*", "/staff/:path*"],
};
