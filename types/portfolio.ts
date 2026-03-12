export type AllocationItem = {
  label: string;
  providerSlug?: string;
  sharePct: number;
  amount?: number | null;
};

export type PlannerModule = "1A" | "1B" | "1C";

export type PortfolioAllocationEntry = {
  id: string;
  rank: number;
  logo?: string | null;
  name: string;
  dccScore: number;
  weightPct: number;
  apyMin: number;
  apyMax: number;
  plannerType: "BTC" | "FIAT" | "STABLECOIN";
  riskBand: string;
};

export type PortfolioOutputs = {
  portfolioScore?: number;
  blendedApyMin?: number;
  blendedApyMax?: number;
  portfolioBand?: string;
  annualIncomeMin?: number;
  annualIncomeMax?: number;
  monthlyIncomeMin?: number;
  monthlyIncomeMax?: number;
  totalWeight?: number;
  isValid?: boolean;
  incomeByPeriod?: { period: string; value: number }[];
};
