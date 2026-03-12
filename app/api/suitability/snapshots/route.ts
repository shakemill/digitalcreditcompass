import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json([], {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  }
  try {
    const rows = await db.suitabilitySnapshot.findMany({
      where: {
        OR: [{ userId: session.sub }, { userId: null }],
      },
      orderBy: { generatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        generatedAt: true,
        clientName: true,
        plannerModule: true,
        dccVersion: true,
      },
    });
    const list = rows.map((r) => ({
      id: r.id,
      generatedAt: r.generatedAt instanceof Date ? r.generatedAt.toISOString() : String(r.generatedAt),
      clientName: r.clientName,
      plannerModule: r.plannerModule,
      dccVersion: r.dccVersion,
    }));
    return NextResponse.json(list, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[GET /api/suitability/snapshots]", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: string }).message)
        : "Internal server error";
    const isDbAccess =
      /denied access|permission|ECONNREFUSED|connection/i.test(message);
    return NextResponse.json(
      {
        error: isDbAccess
          ? "Database connection or permission error. Check DATABASE_URL and that the user has access to the database and public schema."
          : "Internal server error",
      },
      { status: 500 }
    );
  }
}
