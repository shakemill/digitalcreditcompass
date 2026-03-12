import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createScoreSnapshot } from "@/lib/scoring/snapshots";
import type { PlannerType } from "@/types/scoring";
import type { ScoringInputData } from "@/types/scoring";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;
    const provider = await db.provider.findUnique({
      where: { id: providerId },
      include: {
        scoringInputs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const input = provider.scoringInputs[0];
    if (!input) {
      return NextResponse.json(
        { error: "No scoring input found. Add criteria first." },
        { status: 400 }
      );
    }
    const plannerType = provider.plannerType as PlannerType;
    const inputs: ScoringInputData = {};
    if (plannerType === "BTC") {
      if (
        input.transparency == null ||
        input.collateralControl == null ||
        input.jurisdiction == null ||
        input.structuralRisk == null ||
        input.trackRecord == null
      ) {
        return NextResponse.json(
          { error: "All BTC criteria (0–100) are required" },
          { status: 400 }
        );
        }
      inputs.transparency = input.transparency;
      inputs.collateralControl = input.collateralControl;
      inputs.jurisdiction = input.jurisdiction;
      inputs.structuralRisk = input.structuralRisk;
      inputs.trackRecord = input.trackRecord;
    } else if (plannerType === "FIAT") {
      if (
        input.marketVolatility == null ||
        input.incomeMechanism == null ||
        input.seniority == null ||
        input.complexity == null ||
        input.providerQuality == null
      ) {
        return NextResponse.json(
          { error: "All FIAT criteria (0–100) and HV30 if needed are required" },
          { status: 400 }
        );
      }
      inputs.marketVolatility = input.marketVolatility;
      inputs.incomeMechanism = input.incomeMechanism;
      inputs.seniority = input.seniority;
      inputs.complexity = input.complexity;
      inputs.providerQuality = input.providerQuality;
      if (input.hv30 != null) inputs.hv30 = input.hv30;
    } else {
      if (
        input.reserveQuality == null ||
        input.yieldTransparency == null ||
        input.counterpartyRisk == null ||
        input.liquidity == null
      ) {
        return NextResponse.json(
          { error: "All STABLECOIN criteria (0–100) are required" },
          { status: 400 }
        );
      }
      inputs.reserveQuality = input.reserveQuality;
      inputs.yieldTransparency = input.yieldTransparency;
      inputs.counterpartyRisk = input.counterpartyRisk;
      inputs.liquidity = input.liquidity;
      if (input.pegDeviation90d != null) inputs.pegDeviation90d = input.pegDeviation90d;
    }
    const { snapshot } = await createScoreSnapshot({
      providerId,
      scoringInputId: input.id,
      plannerType,
      inputs,
      durationMonths: 12,
    });
    await db.scoringInput.update({
      where: { id: input.id },
      data: {
        allFieldsApproved: true,
        adminApprovedBy: "admin-ui",
        adminApprovedAt: new Date(),
      },
    });
    return NextResponse.json({
      snapshot,
      message: "Score snapshot published.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
