/**
 * Fetches yield board rows from the API and maps to YieldBoardRow.
 * Used by client-side hooks and components. Falls back to mock if API fails or returns empty.
 */
import type { YieldBoardRow } from "@/types/yieldboard";
import { getYieldBoardRows } from "@/data/yieldboard-mock";

type PlannerType = "btc" | "fiat" | "stablecoin";

type ApiProvider = {
  id: string;
  name: string;
  slug: string;
  plannerType: string;
  apyMin: number | null;
  apyMax: number | null;
  maxLtv?: number | null;
  liquidationLtv?: number | null;
  rehypothecation?: string;
  finalScore: number;
  riskBand: string;
  scoreVerifiedAt: string;
  criteriaBreakdown?: Record<string, number>;
  hv30?: number | null;
  marketVolatility?: number | null;
  incomeMechanism?: number | null;
  seniority?: number | null;
  complexity?: number | null;
  providerQuality?: number | null;
  reserveQuality?: number | null;
  yieldTransparency?: number | null;
  counterpartyRisk?: number | null;
  liquidity?: number | null;
  pegDeviation90d?: number | null;
  maxDrawdown90d?: number | null;
};

function rehypToBoolean(rehyp?: string): boolean {
  if (rehyp === "DISCLOSED" || rehyp === "YES") return true;
  return false;
}

/** Map seniority score (0-100) to display label. */
function seniorityLabel(v: number | null | undefined): "senior-preferred" | "preferred" | "junior" | undefined {
  if (v == null) return undefined;
  if (v >= 70) return "senior-preferred";
  if (v >= 50) return "preferred";
  return "junior";
}

/** Derive income type label from incomeMechanism score for display. */
function incomeTypeLabel(v: number | null | undefined): "fixed" | "variable" | "board" | undefined {
  if (v == null) return undefined;
  if (v >= 70) return "fixed";
  if (v >= 50) return "variable";
  return "board";
}

/** Derive stablecoin ticker from provider name/slug (e.g. "Morpho USDC" -> "USDC"). */
function stablecoinFromName(name: string, slug: string): string | undefined {
  const u = name.toUpperCase();
  if (u.includes("USDC")) return "USDC";
  if (u.includes("USDT")) return "USDT";
  if (slug.includes("usdc")) return "USDC";
  if (slug.includes("usdt")) return "USDT";
  return undefined;
}

/** DeFi if slug/name suggests protocol; else CeFi. */
function categoryFromProvider(name: string, slug: string): "DeFi" | "CeFi" | undefined {
  const defi = /morpho|aave|compound|curve|yearn/i;
  if (defi.test(name) || defi.test(slug)) return "DeFi";
  return "CeFi";
}

function mapApiProviderToRow(p: ApiProvider, index: number, plannerType: PlannerType): YieldBoardRow {
  const row: YieldBoardRow = {
    id: p.id,
    rank: index + 1,
    name: p.name,
    plannerType,
    dccScore: p.finalScore,
    riskBand: p.riskBand as YieldBoardRow["riskBand"],
    apyMin: p.apyMin ?? null,
    apyMax: p.apyMax ?? null,
    scoreVerifiedAt: p.scoreVerifiedAt,
    criteriaBreakdown: p.criteriaBreakdown,
  };
  if (p.slug) row.ticker = p.slug;
  if (p.maxLtv != null) row.maxLtv = p.maxLtv;
  if (p.liquidationLtv != null) row.liquidationLtv = p.liquidationLtv;
  if (p.rehypothecation != null) row.rehypothecation = rehypToBoolean(p.rehypothecation);
  if (plannerType === "btc" && p.apyMin == null && p.apyMax == null) row.custody = true;
  if (plannerType === "fiat") {
    if (p.hv30 != null) row.hv30 = p.hv30 / 100;
    row.seniority = seniorityLabel(p.seniority);
    row.incomeType = incomeTypeLabel(p.incomeMechanism);
  }
  if (plannerType === "stablecoin") {
    row.stablecoin = stablecoinFromName(p.name, p.slug);
    row.category = categoryFromProvider(p.name, p.slug);
    row.pegType = "fiat-backed";
    if (p.pegDeviation90d != null) row.maxDepeg90d = Math.abs(p.pegDeviation90d);
    else if (p.maxDrawdown90d != null) row.maxDepeg90d = Math.abs(p.maxDrawdown90d);
  }
  return row;
}

export async function getYieldBoardRowsFromApi(
  plannerType: PlannerType,
  options?: { mode?: "guided" | "custom"; minScore?: number }
): Promise<YieldBoardRow[]> {
  try {
    const params = new URLSearchParams();
    if (options?.mode) params.set("mode", options.mode);
    if (options?.minScore != null) params.set("minScore", String(options.minScore));
    const url = `/api/yield-board/${plannerType}${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return getYieldBoardRows(plannerType);
    const data = await res.json();
    const providers: ApiProvider[] = data?.providers ?? [];
    if (providers.length === 0) return getYieldBoardRows(plannerType);
    return providers.map((p, i) => mapApiProviderToRow(p, i, plannerType));
  } catch {
    return getYieldBoardRows(plannerType);
  }
}

/** Fetch 2–4 providers for compare page from /api/providers/compare */
export async function getCompareProvidersFromApi(
  plannerType: PlannerType,
  ids: string[]
): Promise<YieldBoardRow[]> {
  if (ids.length < 2 || ids.length > 4) return [];
  try {
    const url = `/api/providers/compare?plannerType=${plannerType}&ids=${encodeURIComponent(ids.join(","))}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const providers: ApiProvider[] = data?.providers ?? [];
    return providers.map((p, i) => mapApiProviderToRow(p, i, plannerType));
  } catch {
    return [];
  }
}
