export interface AllocationEntry {
  providerId: string;
  providerName: string;
  ticker?: string;
  plannerType: "BTC" | "FIAT" | "STABLECOIN";
  weightPct: number; // 0-100
  apyMin: number; // ex: 0.06
  apyMax: number; // ex: 0.08
  dccScore: number;
  riskBand: string;
}

export interface PortfolioResult {
  portfolioScore: number;
  blendedApyMin: number;
  blendedApyMax: number;
  portfolioBand: string;
  annualIncomeMin: number;
  annualIncomeMax: number;
  monthlyIncomeMin: number;
  monthlyIncomeMax: number;
  totalWeight: number;
  isValid: boolean;
}

export function computePortfolio(
  allocations: AllocationEntry[],
  capitalUSD: number
): PortfolioResult {
  const totalWeight = allocations.reduce((s, a) => s + a.weightPct, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.5;

  if (allocations.length === 0) {
    return {
      portfolioScore: 0,
      blendedApyMin: 0,
      blendedApyMax: 0,
      portfolioBand: "HIGH",
      annualIncomeMin: 0,
      annualIncomeMax: 0,
      monthlyIncomeMin: 0,
      monthlyIncomeMax: 0,
      totalWeight: 0,
      isValid: false,
    };
  }

  let blendedApyMin = 0;
  let blendedApyMax = 0;
  let portfolioScore = 0;

  for (const a of allocations) {
    const w = a.weightPct / 100;
    blendedApyMin += a.apyMin * w;
    blendedApyMax += a.apyMax * w;
    portfolioScore += a.dccScore * w;
  }

  const annualIncomeMin = capitalUSD * blendedApyMin;
  const annualIncomeMax = capitalUSD * blendedApyMax;

  const band =
    portfolioScore >= 80
      ? "LOW"
      : portfolioScore >= 60
        ? "MEDIUM"
        : portfolioScore >= 40
          ? "ELEVATED"
          : "HIGH";

  return {
    portfolioScore: parseFloat(portfolioScore.toFixed(1)),
    blendedApyMin: parseFloat((blendedApyMin * 100).toFixed(1)),
    blendedApyMax: parseFloat((blendedApyMax * 100).toFixed(1)),
    portfolioBand: band,
    annualIncomeMin,
    annualIncomeMax,
    monthlyIncomeMin: annualIncomeMin / 12,
    monthlyIncomeMax: annualIncomeMax / 12,
    totalWeight,
    isValid,
  };
}

// Guided allocation: top 3 providers with score ≥ 60
export function buildGuidedAllocation(
  providers: AllocationEntry[]
): AllocationEntry[] {
  const eligible = providers
    .filter((p) => p.dccScore >= 60)
    .sort((a, b) => b.dccScore - a.dccScore)
    .slice(0, 3);

  if (eligible.length === 0) return [];
  if (eligible.length === 1) return [{ ...eligible[0], weightPct: 100 }];
  if (eligible.length === 2)
    return [
      { ...eligible[0], weightPct: 70 },
      { ...eligible[1], weightPct: 30 },
    ];
  return [
    { ...eligible[0], weightPct: 70 },
    { ...eligible[1], weightPct: 15 },
    { ...eligible[2], weightPct: 15 },
  ];
}
