import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";
const DCC_COOKIE_NAME = "dcc_session";

/**
 * GET/POST /api/admin/logout
 * Clears admin + user session cookies and redirects to /admin/login in one response.
 * Using a redirect (instead of fetch + location) ensures cookies are cleared reliably in production.
 */
export async function GET(req: NextRequest) {
  return logoutRedirect(req);
}

export async function POST(req: NextRequest) {
  return logoutRedirect(req);
}

function logoutRedirect(req: NextRequest): NextResponse {
  const url = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(url, 302);
  const isProd = process.env.NODE_ENV === "production";

  const cookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };

  res.cookies.set(ADMIN_COOKIE_NAME, "", cookieOpts);
  res.cookies.set(DCC_COOKIE_NAME, "", cookieOpts);

  return res;
}
