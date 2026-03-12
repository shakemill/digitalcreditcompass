import { WEIGHTS, DURATION_MULTIPLIERS, HARD_RULES } from "./weights";
import type { PlannerType, ScoringInputData, ScoreResult } from "@/types/scoring";

export function getDurationMultiplier(durationMonths: number): number {
  const entry = DURATION_MULTIPLIERS.find(
    (d) => durationMonths >= d.minMonths && durationMonths <= d.maxMonths
  );
  return entry?.multiplier ?? 0.8;
}

export function getRiskBand(
  score: number
): "LOW" | "MEDIUM" | "ELEVATED" | "HIGH" {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "ELEVATED";
  return "HIGH";
}

export function computeScore(
  plannerType: PlannerType,
  inputs: ScoringInputData,
  durationMonths: number,
  isAlgoStablecoin = false
): ScoreResult {
  const weights = WEIGHTS[plannerType];
  let rawScore = 0;
  const criteriaBreakdown: Record<string, number> = {};

  // Apply HV30 hard cap for FIAT
  let adjustedInputs = { ...inputs };
  if (
    plannerType === "FIAT" &&
    inputs.hv30 != null &&
    inputs.hv30 > HARD_RULES.HV30_FIAT_CAP_THRESHOLD
  ) {
    adjustedInputs.marketVolatility = Math.min(
      inputs.marketVolatility ?? 0,
      (HARD_RULES.HV30_FIAT_C1_CAP / 30) * 100
    );
  }

  for (const [criterion, weight] of Object.entries(weights)) {
    const criterionScore =
      adjustedInputs[criterion as keyof typeof adjustedInputs] ?? 0;
    const contribution = (criterionScore as number) * (weight as number);
    criteriaBreakdown[criterion] = criterionScore as number;
    rawScore += contribution;
  }

  const multiplier = getDurationMultiplier(durationMonths);
  let finalScore = Math.round(
    Math.min(100, Math.max(0, rawScore * multiplier))
  );

  // Hard cap algorithmic stablecoins
  if (isAlgoStablecoin) {
    finalScore = Math.min(finalScore, HARD_RULES.ALGO_STABLECOIN_CAP);
  }

  // Auto-flag peg deviation
  const pegAutoFlagged =
    plannerType === "STABLECOIN" &&
    inputs.pegDeviation90d != null &&
    Math.abs(inputs.pegDeviation90d) > HARD_RULES.PEG_DEVIATION_AUTO_FLAG;

  return {
    rawScore,
    durationMultiplier: multiplier,
    finalScore,
    riskBand: getRiskBand(finalScore),
    criteriaBreakdown,
    pegAutoFlagged,
    scoreVersion: "1.0",
  };
}
