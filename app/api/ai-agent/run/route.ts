import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { runPipeline } from "@/lib/ai-agent/pipeline";
import type { PlannerTypeAgent } from "@/types/ai-agent";

const bodySchema = z.object({
  providerId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "providerId required" }, { status: 400 });
    }
    const provider = await db.provider.findUnique({
      where: { id: parsed.data.providerId },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const plannerType = provider.plannerType.toLowerCase() as PlannerTypeAgent;
    if (plannerType !== "btc" && plannerType !== "fiat" && plannerType !== "stablecoin") {
      return NextResponse.json({ error: "Unsupported planner type" }, { status: 400 });
    }

    const output = await runPipeline({
      providerId: provider.id,
      providerName: provider.name,
      providerSlug: provider.slug,
      plannerType,
    });

    const pack = await db.evidencePack.create({
      data: {
        providerId: provider.id,
        proposedClassifications: output.proposedClassifications,
        overallConfidence: output.overallAgentConfidence,
        publishBlocked: true,
        fieldsRequiringReview: output.fieldsRequiringReview,
        criticalFieldsBelowThreshold: output.criticalFieldsBelowThreshold,
        adminStatus: "PENDING",
      },
    });

    return NextResponse.json({
      evidencePackId: pack.id,
      providerId: provider.id,
      overallAgentConfidence: output.overallAgentConfidence,
      message: "Evidence pack created; pending admin review.",
    });
  } catch (e) {
    console.error("AI agent run error:", e);
    return NextResponse.json(
      { error: "AI agent run failed" },
      { status: 500 }
    );
  }
}
