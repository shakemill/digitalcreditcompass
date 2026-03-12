import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const STALE_DAYS = 7;

export async function GET() {
  try {
    const rows = await db.marketDataCache.findMany({
      select: { fetchedAt: true, isStale: true },
    });
    if (rows.length === 0) {
      return NextResponse.json({ stale: false });
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STALE_DAYS);
    const stale =
      rows.some((r) => r.isStale) ||
      rows.some((r) => r.fetchedAt < cutoff);
    return NextResponse.json({ stale: !!stale });
  } catch {
    return NextResponse.json({ stale: true });
  }
}
