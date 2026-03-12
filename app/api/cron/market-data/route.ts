import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchMarketDataForProvider } from "@/lib/market-data/fetcher";

/**
 * Cron job: update MarketDataCache and ScoringInput market data for all providers.
 * Call via Vercel Cron (GET) or manually. Protect with CRON_SECRET in production.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const providers = await db.provider.findMany({
      where: {
        isActive: true,
        plannerType: { in: ["FIAT", "STABLECOIN"] },
      },
      select: { id: true, slug: true, plannerType: true },
    });

    let updated = 0;
    for (const p of providers) {
      const data = await fetchMarketDataForProvider({
        providerId: p.id,
        plannerType: p.plannerType as "FIAT" | "STABLECOIN",
        slug: p.slug,
      });

      await db.marketDataCache.upsert({
        where: { providerId: p.id },
        create: {
          providerId: p.id,
          hv30: data.hv30 ?? null,
          pegDeviation: data.pegDeviation90d ?? null,
          maxDrawdown90d: data.maxDrawdown90d ?? null,
          tvl: data.tvl ?? null,
          source: data.source,
          fetchedAt: new Date(data.fetchedAt),
          isStale: false,
        },
        update: {
          hv30: data.hv30 ?? undefined,
          pegDeviation: data.pegDeviation90d ?? undefined,
          maxDrawdown90d: data.maxDrawdown90d ?? undefined,
          tvl: data.tvl ?? undefined,
          source: data.source,
          fetchedAt: new Date(data.fetchedAt),
          isStale: false,
        },
      });

      const latestInput = await db.scoringInput.findFirst({
        where: { providerId: p.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestInput) {
        await db.scoringInput.update({
          where: { id: latestInput.id },
          data: {
            marketDataFetchedAt: new Date(data.fetchedAt),
            ...(data.hv30 != null && { hv30: data.hv30 }),
            ...(data.pegDeviation90d != null && { pegDeviation90d: data.pegDeviation90d }),
            ...(data.maxDrawdown90d != null && { maxDrawdown90d: data.maxDrawdown90d }),
            ...(data.tvl != null && { tvl: data.tvl }),
          },
        });
      }
      updated++;
    }

    return NextResponse.json({
      ok: true,
      message: `Updated market data for ${updated} providers.`,
      updated,
    });
  } catch (e) {
    console.error("Market data cron error:", e);
    return NextResponse.json(
      { error: "Market data job failed" },
      { status: 500 }
    );
  }
}
