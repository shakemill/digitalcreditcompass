import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Parse DATABASE_URL for display (no password). */
function getDbHint(): { databaseUrlSet: boolean; database?: string; host?: string; user?: string } {
  const url = process.env.DATABASE_URL;
  if (!url) return { databaseUrlSet: false };
  try {
    const u = new URL(url.replace(/^postgresql:\/\//, "https://"));
    const dbName = u.pathname?.replace(/^\//, "").split("?")[0] || undefined;
    const user = u.username || undefined;
    return { databaseUrlSet: true, database: dbName || undefined, host: u.hostname || undefined, user: user || undefined };
  } catch {
    return { databaseUrlSet: true };
  }
}

/**
 * GET /api/health/db — Test database connection.
 * Returns 200 with { ok: true } if connected, 503 with error details if not.
 */
export async function GET() {
  const hint = getDbHint();
  try {
    await db.$queryRawUnsafe("SELECT 1");
    return NextResponse.json({
      ok: true,
      message: "Database connection OK",
      ...hint,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/health/db]", err);
    return NextResponse.json(
      {
        ok: false,
        error: "Database connection failed",
        details: message,
        hint: {
          ...hint,
          note: "Check hint.user: if it shows postgres but you use shakemill, update DATABASE_URL in .env and restart the dev server (Ctrl+C then pnpm run dev).",
        },
      },
      { status: 503 }
    );
  }
}
