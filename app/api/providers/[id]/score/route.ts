import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createScoreSnapshot } from "@/lib/scoring/snapshots";
import type { ScoringInputData } from "@/types/scoring";

const postSchema = z.object({
  durationMonths: z.number().min(0).default(12),
  isAlgoStablecoin: z.boolean().optional(),
});

function scoringInputToData(input: {
  transparency?: number | null;
  collateralControl?: number | null;
  jurisdiction?: number | null;
  structuralRisk?: number | null;
  trackRecord?: number | null;
  marketVolatility?: number | null;
  incomeMechanism?: number | null;
  seniority?: number | null;
  complexity?: number | null;
  providerQuality?: number | null;
  reserveQuality?: number | null;
  yieldTransparency?: number | null;
  counterpartyRisk?: number | null;
  liquidity?: number | null;
  hv30?: number | null;
  pegDeviation90d?: number | null;
}): ScoringInputData {
  return {
    transparency: input.transparency ?? undefined,
    collateralControl: input.collateralControl ?? undefined,
    jurisdiction: input.jurisdiction ?? undefined,
    structuralRisk: input.structuralRisk ?? undefined,
    trackRecord: input.trackRecord ?? undefined,
    marketVolatility: input.marketVolatility ?? undefined,
    incomeMechanism: input.incomeMechanism ?? undefined,
    seniority: input.seniority ?? undefined,
    complexity: input.complexity ?? undefined,
    providerQuality: input.providerQuality ?? undefined,
    reserveQuality: input.reserveQuality ?? undefined,
    yieldTransparency: input.yieldTransparency ?? undefined,
    counterpartyRisk: input.counterpartyRisk ?? undefined,
    liquidity: input.liquidity ?? undefined,
    hv30: input.hv30 ?? undefined,
    pegDeviation90d: input.pegDeviation90d ?? undefined,
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = postSchema.safeParse(body);
    const { durationMonths, isAlgoStablecoin } = parsed.success
      ? parsed.data
      : { durationMonths: 12, isAlgoStablecoin: false };

    const provider = await db.provider.findUnique({
      where: { id: providerId },
      include: {
        scoringInputs: {
          where: { allFieldsApproved: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const scoringInput = provider.scoringInputs[0];
    if (!scoringInput) {
      return NextResponse.json(
        { error: "No approved scoring input (allFieldsApproved must be true)" },
        { status: 400 }
      );
    }

    const inputs = scoringInputToData(scoringInput);
    const { snapshot, scoreResult } = await createScoreSnapshot({
      providerId,
      scoringInputId: scoringInput.id,
      plannerType: provider.plannerType,
      inputs,
      durationMonths,
      isAlgoStablecoin,
    });

    return NextResponse.json({ snapshot, scoreResult });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
