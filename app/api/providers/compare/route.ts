import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  plannerType: z.enum(["btc", "fiat", "stablecoin"]),
  ids: z.string().min(1), // comma-separated provider IDs, 2–4
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      plannerType: searchParams.get("plannerType") ?? undefined,
      ids: searchParams.get("ids") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "plannerType and ids (comma-separated) required" },
        { status: 400 }
      );
    }
    const plannerTypeUpper = parsed.data.plannerType.toUpperCase() as "BTC" | "FIAT" | "STABLECOIN";
    const ids = parsed.data.ids
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length < 2 || ids.length > 4) {
      return NextResponse.json(
        { error: "ids must be 2 to 4 provider IDs" },
        { status: 400 }
      );
    }

    const providers = await db.provider.findMany({
      where: {
        id: { in: ids },
        plannerType: plannerTypeUpper,
        isActive: true,
      },
      include: {
        scoreSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (providers.length !== ids.length) {
      return NextResponse.json(
        { error: "Some IDs not found or not active for this planner type" },
        { status: 400 }
      );
    }

    const inputIds = providers
      .map((p) => p.scoreSnapshots[0]?.scoringInputId)
      .filter((id): id is string => !!id);
    const scoringInputs =
      inputIds.length > 0
        ? await db.scoringInput.findMany({
            where: { id: { in: inputIds } },
            select: {
              id: true,
              hv30: true,
              marketVolatility: true,
              incomeMechanism: true,
              seniority: true,
              complexity: true,
              providerQuality: true,
              reserveQuality: true,
              yieldTransparency: true,
              counterpartyRisk: true,
              liquidity: true,
              pegDeviation90d: true,
              maxDrawdown90d: true,
            },
          })
        : [];
    const inputById = Object.fromEntries(scoringInputs.map((i) => [i.id, i]));

    const withScore = providers.map((p) => {
      const snap = p.scoreSnapshots[0];
      const input = snap ? inputById[snap.scoringInputId] : null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        plannerType: p.plannerType,
        apyMin: p.apyMin,
        apyMax: p.apyMax,
        maxLtv: p.maxLtv,
        liquidationLtv: p.liquidationLtv,
        rehypothecation: p.rehypothecation,
        finalScore: snap?.finalScore ?? 0,
        riskBand: snap?.riskBand ?? "HIGH",
        scoreVerifiedAt: snap?.createdAt?.toISOString() ?? new Date().toISOString(),
        criteriaBreakdown: (snap?.criteriaBreakdown as Record<string, number>) ?? {},
        hv30: input?.hv30 ?? null,
        marketVolatility: input?.marketVolatility ?? null,
        incomeMechanism: input?.incomeMechanism ?? null,
        seniority: input?.seniority ?? null,
        complexity: input?.complexity ?? null,
        providerQuality: input?.providerQuality ?? null,
        reserveQuality: input?.reserveQuality ?? null,
        yieldTransparency: input?.yieldTransparency ?? null,
        counterpartyRisk: input?.counterpartyRisk ?? null,
        liquidity: input?.liquidity ?? null,
        pegDeviation90d: input?.pegDeviation90d ?? null,
        maxDrawdown90d: input?.maxDrawdown90d ?? null,
      };
    });

    return NextResponse.json({
      plannerType: parsed.data.plannerType,
      providers: withScore,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
