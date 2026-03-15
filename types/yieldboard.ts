export type PlannerType = "btc" | "stablecoin" | "fiat";

export type RiskBand = "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";

export interface YieldBoardRow {
  id: string;
  rank: number;
  name: string;
  ticker?: string;
  plannerType: PlannerType;
  dccScore: number;
  riskBand: RiskBand;
  apyMin: number | null;
  apyMax: number | null;
  scoreVerifiedAt: string;
  // BTC-specific
  maxLtv?: number | null;
  liquidationLtv?: number | null;
  rehypothecation?: boolean;
  custody?: boolean;
  // Stablecoin-specific
  stablecoin?: string;
  stablecoinTypes?: string[];
  category?: "DeFi" | "CeFi";
  pegType?: string;
  notes?: string;
  maxDepeg90d?: number;
  withdrawalSpeed?: "instant" | "<7d" | "<30d" | "locked";
  // Fiat-specific
  hv30?: number;
  incomeType?: "fixed" | "variable" | "board";
  seniority?: "senior-preferred" | "preferred" | "junior";
  // Expanded row data
  criteriaBreakdown?: Record<string, number>;
  evidenceLinks?: Array<{ label: string; url: string }>;
}
