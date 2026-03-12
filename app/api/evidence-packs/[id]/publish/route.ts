import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createScoreSnapshot } from "@/lib/scoring/snapshots";
import type { PlannerType } from "@/types/scoring";
import type { ScoringInputData } from "@/types/scoring";

function parseProposedValue(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace("%", "").trim());
    if (!Number.isNaN(n)) return n;
    if (v.endsWith("%")) return n;
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pack = await db.evidencePack.findUnique({
      where: { id },
      include: { provider: true },
    });
    if (!pack) {
      return NextResponse.json(
        { error: "Evidence pack not found" },
        { status: 404 }
      );
    }
    if (!pack.publishBlocked) {
      return NextResponse.json(
        { error: "Pack already published" },
        { status: 400 }
      );
    }
    const classifications = (pack.proposedClassifications || {}) as Record<
      string,
      { proposedValue?: unknown }
    >;
    const plannerType = pack.provider.plannerType as PlannerType;
    const inputs: ScoringInputData = {};

    if (plannerType === "BTC") {
      const keys = ["transparency", "collateralControl", "jurisdiction", "structuralRisk", "trackRecord"];
      for (const k of keys) {
        const v = parseProposedValue(classifications[k]?.proposedValue);
        if (v == null || v < 0 || v > 100) {
          return NextResponse.json(
            { error: `Missing or invalid criteria: ${k}` },
            { status: 400 }
          );
        }
        (inputs as Record<string, number>)[k] = v;
      }
    } else if (plannerType === "FIAT") {
      const keys = ["marketVolatility", "incomeMechanism", "seniority", "complexity", "providerQuality"];
      for (const k of keys) {
        const v = parseProposedValue(classifications[k]?.proposedValue);
        if (v == null || v < 0 || v > 100) {
          return NextResponse.json(
            { error: `Missing or invalid criteria: ${k}` },
            { status: 400 }
          );
        }
        (inputs as Record<string, number>)[k] = v;
      }
      const hv30 = parseProposedValue(classifications.hv30?.proposedValue);
      if (hv30 != null) inputs.hv30 = hv30;
    } else {
      const keys = ["reserveQuality", "yieldTransparency", "counterpartyRisk", "liquidity"];
      for (const k of keys) {
        const v = parseProposedValue(classifications[k]?.proposedValue);
        if (v == null || v < 0 || v > 100) {
          return NextResponse.json(
            { error: `Missing or invalid criteria: ${k}` },
            { status: 400 }
          );
        }
        (inputs as Record<string, number>)[k] = v;
      }
      const peg = parseProposedValue(classifications.pegDeviation90d?.proposedValue);
      if (peg != null) inputs.pegDeviation90d = peg;
    }

    const createData: Record<string, unknown> = {
      providerId: pack.providerId,
      evidencePackRef: pack.id,
      allFieldsApproved: true,
      adminApprovedBy: "evidence-pack-publish",
      adminApprovedAt: new Date(),
    };
    Object.entries(inputs).forEach(([k, v]) => {
      createData[k] = v;
    });
    const scoringInput = await db.scoringInput.create({
      data: createData as Parameters<typeof db.scoringInput.create>[0]["data"],
    });

    const { snapshot } = await createScoreSnapshot({
      providerId: pack.providerId,
      scoringInputId: scoringInput.id,
      plannerType,
      inputs,
      durationMonths: 12,
    });

    await db.evidencePack.update({
      where: { id },
      data: {
        publishBlocked: false,
        adminStatus: "APPROVED",
        reviewedBy: "evidence-pack-publish",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      snapshot,
      scoringInputId: scoringInput.id,
      message: "Evidence pack published; score snapshot created.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
