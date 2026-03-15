import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { buildGuidedAllocation } from "@/lib/portfolio/allocator";
import type { AllocationEntry } from "@/lib/portfolio/allocator";

const querySchema = z.object({
  mode: z.enum(["guided", "custom"]).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
});

const typeSchema = z.enum(["btc", "fiat", "stablecoin"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const typeParam = typeSchema.safeParse((await params).type);
    if (!typeParam.success) {
      return NextResponse.json(
        { error: "Invalid type: use btc, fiat, or stablecoin" },
        { status: 400 }
      );
    }
    const plannerType = typeParam.data.toUpperCase() as
      | "BTC"
      | "FIAT"
      | "STABLECOIN";

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      mode: searchParams.get("mode") ?? undefined,
      minScore: searchParams.get("minScore") ?? undefined,
    });
    const { mode = "custom", minScore = 0 } = parsed.success
      ? parsed.data
      : { mode: "custom" as const, minScore: 0 };

    const providers = await db.provider.findMany({
      where: { plannerType, isActive: true },
      include: {
        scoreSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

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
    const inputById = Object.fromEntries(
      scoringInputs.map((i) => [i.id, i])
    );

    const withScore = providers
      .map((p) => {
        const snap = p.scoreSnapshots[0];
        const input = snap ? inputById[snap.scoringInputId] : null;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          plannerType: p.plannerType,
          apyMin: p.apyMin != null ? Number(p.apyMin) : null,
          apyMax: p.apyMax != null ? Number(p.apyMax) : null,
          maxLtv: p.maxLtv,
          liquidationLtv: p.liquidationLtv,
          rehypothecation: p.rehypothecation,
          providerCategory: p.providerCategory ?? null,
          stablecoinTypes: p.stablecoinTypes ?? null,
          pegType: p.pegType ?? null,
          notes: p.notes ?? null,
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
      })
      .filter((p) => p.finalScore >= minScore)
      .sort((a, b) => b.finalScore - a.finalScore);

    const entries: AllocationEntry[] = withScore.map((p) => ({
      providerId: p.id,
      providerName: p.name,
      plannerType: p.plannerType,
      weightPct: 0,
      apyMin: p.apyMin ?? 0,
      apyMax: p.apyMax ?? 0,
      dccScore: p.finalScore,
      riskBand: p.riskBand,
    }));

    const guidedAllocation =
      mode === "guided" ? buildGuidedAllocation(entries) : null;

    return NextResponse.json({
      providers: withScore,
      guidedAllocation,
    });
  } catch (e) {
    console.error("Yield board API error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
