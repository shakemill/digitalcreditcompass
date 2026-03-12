/**
 * DCC Scoring Engine — memo A.4 verbatim.
 * Standalone for Yield Board display; does not replace lib/scoring/engine.ts used by planners.
 */

import type { PlannerType, RiskBand } from "@/types/yieldboard";

export const WEIGHTS = {
  btc: {
    transparency: 0.3,
    collateralControl: 0.25,
    jurisdiction: 0.2,
    structuralRisk: 0.15,
    trackRecord: 0.1,
  },
  stablecoin: {
    reserveQuality: 0.28,
    yieldTransparency: 0.22,
    counterpartyRisk: 0.2,
    liquidity: 0.15,
    jurisdiction: 0.1,
    trackRecord: 0.05,
  },
  fiat: {
    marketVolatility: 0.3,
    incomeMechanism: 0.25,
    seniority: 0.15,
    complexity: 0.15,
    providerQuality: 0.15,
  },
} as const;

export function getDurationMultiplier(months: number): number {
  if (months < 3) return 1.0;
  if (months < 6) return 0.97;
  if (months < 12) return 0.93;
  if (months < 24) return 0.87;
  return 0.8;
}

function getBand(score: number): RiskBand {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "ELEVATED";
  return "HIGH";
}

export type ScoringInputs = Record<string, number>;

export interface ComputeScoreResult {
  rawScore: number;
  finalScore: number;
  band: RiskBand;
  durationMultiplier: number;
}

export function computeScore(
  inputs: ScoringInputs,
  plannerType: PlannerType,
  durationMonths?: number
): ComputeScoreResult {
  const weights = WEIGHTS[plannerType];
  const durationMultiplier =
    durationMonths != null
      ? getDurationMultiplier(durationMonths)
      : 1;
  let rawScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const value = inputs[key] ?? 0;
    rawScore += value * weight;
  }
  const finalScore = Math.round(
    Math.min(100, Math.max(0, rawScore * durationMultiplier))
  );
  return {
    rawScore,
    finalScore,
    band: getBand(finalScore),
    durationMultiplier,
  };
}
