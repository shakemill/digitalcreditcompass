import type { BtcPlannerResult } from "@/lib/planner/btc";

export type BtcPlannerState = {
  totalNeed12m?: number;
  apr?: number;
  btcPrice?: number;
  ltv?: number;
  liquidationLtv?: number;
  durationMonths?: number;
  result?: BtcPlannerResult | null;
  scenarios: Record<string, string | number | undefined>[];
};

export type BtcScenarioRow = {
  ltv: number;
  btcRequired: number;
  liquidationPrice: number;
  sri: number;
  riskBand: "GREEN" | "AMBER" | "RED";
};

export type FiatPlannerState = {
  capital?: number;
  durationMonths?: number;
  selectedTickers: string[];
  mode: "guided" | "custom";
  scenarios: Record<string, string | number | undefined>[];
};

export type FiatInstrument = {
  ticker: string;
  name: string;
  dccScore: number;
  apyEstimate: number;
  hv30: number;
  riskBand: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
  /** Proto / coming soon – card shown but not selectable */
  disabled?: boolean;
};

export type StablecoinProto = "USDC" | "USDT";

export type StablecoinPlannerState = {
  selectedProto: StablecoinProto | null;
  capital?: number;
  durationMonths?: number;
  mode: "guided" | "custom";
  /** Custom mode only: DeFi share of capital (0–100). CeFi = 100 - customDefiPct. */
  customDefiPct?: number;
  scenarios?: Record<string, string | number | undefined>[];
};

export type PegMonitorRow = {
  id: string;
  name: string;
  trackPegPct: number;
  deviation: number;
  riskBand: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
};
