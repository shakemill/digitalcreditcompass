import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth/session";
import { getLandingSEOSettings, setLandingSEOSettings } from "@/lib/site-settings";

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
    const settings = await getLandingSEOSettings();
    return NextResponse.json(settings);
  } catch (e) {
    console.error("[GET /api/admin/seo]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const patchSchema = {
  title: (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : undefined),
  description: (v: unknown) => (typeof v === "string" ? v.slice(0, 500) : undefined),
  keywords: (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : undefined),
  ogTitle: (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : undefined),
  ogDescription: (v: unknown) => (typeof v === "string" ? v.slice(0, 500) : undefined),
};

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookie();
  if (!isAdmin(req, session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const updates: Parameters<typeof setLandingSEOSettings>[0] = {};
    if (body.title !== undefined) {
      const v = patchSchema.title(body.title);
      if (v !== undefined) updates.title = v;
    }
    if (body.description !== undefined) {
      const v = patchSchema.description(body.description);
      if (v !== undefined) updates.description = v;
    }
    if (body.keywords !== undefined) {
      const v = patchSchema.keywords(body.keywords);
      if (v !== undefined) updates.keywords = v;
    }
    if (body.ogTitle !== undefined) {
      const v = patchSchema.ogTitle(body.ogTitle);
      if (v !== undefined) updates.ogTitle = v;
    }
    if (body.ogDescription !== undefined) {
      const v = patchSchema.ogDescription(body.ogDescription);
      if (v !== undefined) updates.ogDescription = v;
    }
    await setLandingSEOSettings(updates);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[PATCH /api/admin/seo]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
