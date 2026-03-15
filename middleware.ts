import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionAsync } from "@/lib/auth/session-edge";

const PUBLIC_PATHS = ["/auth", "/api/auth", "/api/stripe/webhook", "/_next", "/favicon"];
const AUTH_PATH_PREFIX = "/auth/";

function isPublic(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return true;
  if (pathname.startsWith("/api/auth/") || pathname === "/api/auth") return true;
  if (pathname === "/api/plans") return true;
  if (pathname === "/api/site-settings") return true;
  if (pathname === "/api/download-risk-methodology") return true;
  if (pathname.startsWith("/api/stripe/webhook")) return true;
  if (pathname === "/api/v1") return true;
  if (pathname.startsWith("/auth")) return true;
  if (pathname === "/pricing" || pathname === "/contact" || pathname === "/coming-soon") return true;
  // Static assets in public/ (e.g. logo) must be served without auth
  if (/\.(png|jpg|jpeg|gif|ico|svg|webp|woff2?)$/i.test(pathname) || pathname === "/logo-dcc.png") return true;
  return false;
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Allow /api/admin/* when admin_session cookie is set (admin panel login)
  if (pathname.startsWith("/api/admin") && request.cookies.get("admin_session")?.value === "1") {
    return NextResponse.next();
  }

  const session = await getSessionAsync(request);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath(pathname)) {
    const hasAdminCookie =
      request.cookies.get("admin_session")?.value === "1";
    const isSuperAdmin = session.role === "SUPER_ADMIN";
    if (!hasAdminCookie && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard/pro") && session.role !== "PRO" && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/dashboard/admin") && session.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
