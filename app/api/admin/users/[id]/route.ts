import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";

const ADMIN_COOKIE = "admin_session";

function isAdmin(request: NextRequest, session: { role: string } | null): boolean {
  if (session?.role === "SUPER_ADMIN") return true;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  return cookie === "1";
}

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["FREE", "PRO"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookie();
  if (!isAdmin(req, session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const data = parsed.data as Record<string, unknown>;
    const update: { isActive?: boolean; role?: "FREE" | "PRO" } = {};
    if (typeof data.isActive === "boolean") update.isActive = data.isActive;
    if (data.role === "FREE" || data.role === "PRO") update.role = data.role;
    const user = await db.user.update({
      where: { id },
      data: update,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error("[PATCH /api/admin/users/[id]]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
