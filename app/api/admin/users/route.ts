import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";

const ADMIN_COOKIE = "admin_session";

function isAdmin(request: NextRequest, session: { role: string } | null): boolean {
  if (session?.role === "SUPER_ADMIN") return true;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  return cookie === "1";
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!isAdmin(req, session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });
    const list = users.map((u) => {
      const sub = u.subscriptions[0];
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        emailVerified: u.emailVerified,
        subscriptionPeriodStart: u.subscriptionPeriodStart?.toISOString() ?? null,
        subscriptionPeriodEnd: u.subscriptionPeriodEnd?.toISOString() ?? null,
        billingInterval: u.billingInterval,
        createdAt: u.createdAt.toISOString(),
        plan: sub?.plan ? { slug: sub.plan.slug, name: sub.plan.name } : null,
        subscriptionStatus: sub?.status ?? null,
        currentPeriodEnd: sub?.currentPeriodEnd?.toISOString() ?? null,
      };
    });
    return NextResponse.json({ users: list });
  } catch (e) {
    console.error("[GET /api/admin/users]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
