import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/prisma";

const POLL_ATTEMPTS = 5;
const POLL_DELAY_MS = 1000;

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  const redirectTo = req.nextUrl.searchParams.get("redirect") || "/dashboard/pro";
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard/pro";

  // After Stripe checkout, webhook may still be processing: poll for PRO role briefly
  if (safeRedirect.includes("/dashboard/pro")) {
    for (let i = 0; i < POLL_ATTEMPTS; i++) {
      const user = await db.user.findUnique({
        where: { id: session.sub },
        select: { id: true, email: true, name: true, role: true },
      });
      if (user?.role === "PRO" || user?.role === "SUPER_ADMIN") {
        await setSessionCookie({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
        return NextResponse.redirect(new URL(safeRedirect, req.url));
      }
      if (i < POLL_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, POLL_DELAY_MS));
      }
    }
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  await setSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
