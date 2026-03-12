// ⚠ APPEND-ONLY — Never call prisma.scoreSnapshot.update() or delete()
import { db } from "@/lib/db";
import { computeScore } from "./engine";
import type { PlannerType, ScoringInputData } from "@/types/scoring";

export async function createScoreSnapshot(params: {
  providerId: string;
  scoringInputId: string;
  plannerType: PlannerType;
  inputs: ScoringInputData;
  durationMonths: number;
  isAlgoStablecoin?: boolean;
}) {
  const result = computeScore(
    params.plannerType,
    params.inputs,
    params.durationMonths,
    params.isAlgoStablecoin
  );

  // INSERT only — never update existing snapshots
  const snapshot = await db.scoreSnapshot.create({
    data: {
      providerId: params.providerId,
      scoringInputId: params.scoringInputId,
      plannerType: params.plannerType,
      rawScore: result.rawScore,
      durationMultiplier: result.durationMultiplier,
      finalScore: result.finalScore,
      riskBand: result.riskBand,
      scoreVersion: result.scoreVersion,
      criteriaBreakdown: result.criteriaBreakdown,
    },
  });

  return { snapshot, scoreResult: result };
}

export async function getLatestSnapshot(providerId: string) {
  return db.scoreSnapshot.findFirst({
    where: { providerId },
    orderBy: { createdAt: "desc" },
  });
}
