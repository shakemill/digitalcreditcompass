import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { setComingSoonEnabled } from "@/lib/site-settings";

const ADMIN_COOKIE = "admin_session";

function isAdmin(request: NextRequest, session: { role: string } | null): boolean {
  if (session?.role === "SUPER_ADMIN") return true;
  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  return cookie === "1";
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!isAdmin(req, session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { comingSoonEnabled?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.comingSoonEnabled !== "boolean") {
    return NextResponse.json({ error: "comingSoonEnabled must be a boolean" }, { status: 400 });
  }
  await setComingSoonEnabled(body.comingSoonEnabled);
  return NextResponse.json({ ok: true });
}
