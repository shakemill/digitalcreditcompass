import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runPipeline } from "@/lib/ai-agent/pipeline";
import type { PlannerTypeAgent } from "@/types/ai-agent";
import { getWhitelistForProvider } from "@/lib/ai-agent/whitelist";

/**
 * Cron: run AI agent pipeline for providers that have whitelist URLs (safety-critical re-check weekly).
 * Protect with CRON_SECRET in production.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const providers = await db.provider.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, plannerType: true },
    });

    const withWhitelist = providers.filter((p) => getWhitelistForProvider(p.slug).length > 0);
    let created = 0;

    for (const provider of withWhitelist.slice(0, 10)) {
      const plannerType = provider.plannerType.toLowerCase() as PlannerTypeAgent;
      if (plannerType !== "btc" && plannerType !== "fiat" && plannerType !== "stablecoin") continue;
      try {
        const output = await runPipeline({
          providerId: provider.id,
          providerName: provider.name,
          providerSlug: provider.slug,
          plannerType,
        });
        await db.evidencePack.create({
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
        created++;
      } catch (e) {
        console.error("AI agent run failed for", provider.slug, e);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Created ${created} evidence packs (safety-critical re-check).`,
      created,
    });
  } catch (e) {
    console.error("AI agent cron error:", e);
    return NextResponse.json(
      { error: "AI agent cron failed" },
      { status: 500 }
    );
  }
}
