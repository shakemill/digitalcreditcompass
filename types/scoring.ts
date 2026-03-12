export type PlannerType = "BTC" | "FIAT" | "STABLECOIN";

export type RiskBand = "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";

/** All possible scoring criteria (optional) + market data used by engine */
export type ScoringInputData = {
  // BTC
  transparency?: number;
  collateralControl?: number;
  jurisdiction?: number;
  structuralRisk?: number;
  trackRecord?: number;
  // FIAT
  marketVolatility?: number;
  incomeMechanism?: number;
  seniority?: number;
  complexity?: number;
  providerQuality?: number;
  // STABLECOIN
  reserveQuality?: number;
  yieldTransparency?: number;
  counterpartyRisk?: number;
  liquidity?: number;
  // Market / hard rules
  hv30?: number;
  pegDeviation90d?: number;
};

export type ScoreResult = {
  rawScore: number;
  durationMultiplier: number;
  finalScore: number;
  riskBand: RiskBand;
  criteriaBreakdown: Record<string, number>;
  pegAutoFlagged: boolean;
  scoreVersion: string;
};

export type ScoreSnapshotPayload = {
  providerId: string;
  scoringInputId: string;
  rawScore: number;
  durationMultiplier: number;
  finalScore: number;
  riskBand: RiskBand;
  scoreVersion: string;
  plannerType: PlannerType;
  criteriaBreakdown: Record<string, number>;
};

export type CriteriaBreakdown = Record<string, number>;
