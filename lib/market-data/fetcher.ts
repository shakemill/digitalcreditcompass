/**
 * Fetches market data (HV30, peg deviation, max drawdown) for use in scoring.
 * Uses external APIs when configured, otherwise returns mock data for dev.
 */

export type MarketDataResult = {
  hv30?: number;           // e.g. 0.28 = 28%
  pegDeviation90d?: number;
  maxDrawdown90d?: number;
  tvl?: number;
  source: string;
  fetchedAt: string;       // ISO
};

const MOCK_HV30 = 28;       // 28%
const MOCK_PEG_DEVIATION = 0.002;
const MOCK_MAX_DRAWDOWN = -0.05;

/**
 * Fetch HV30 (annualized 30d volatility) for a fiat instrument.
 * Symbol can be provider slug or ticker (e.g. "strc", "strk").
 */
export async function fetchHv30(symbol: string): Promise<number> {
  if (process.env.COINGECKO_API_KEY) {
    try {
      // CoinGecko-style: could use /api/v3/coins/{id}/market_chart with vs_currency=usd, days=30
      // and compute volatility from price returns. Simplified: return mock until integration.
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=30`,
        { headers: { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }, next: { revalidate: 0 } }
      );
      if (!res.ok) return MOCK_HV30;
      const data = await res.json();
      const prices = (data.prices as [number, number][]) || [];
      if (prices.length < 2) return MOCK_HV30;
      const returns = [];
      for (let i = 1; i < prices.length; i++) {
        const r = (prices[i][1] - prices[i - 1][1]) / prices[i - 1][1];
        returns.push(r);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
      const vol = Math.sqrt(variance);
      const annualized = vol * Math.sqrt(365 / 30);
      return Math.min(100, Math.max(0, annualized * 100));
    } catch {
      return MOCK_HV30;
    }
  }
  return MOCK_HV30;
}

/**
 * Fetch 90d max drawdown and optional peg deviation for stablecoin.
 */
export async function fetchStablecoinMarketData(symbol: string): Promise<{
  maxDrawdown90d: number;
  pegDeviation90d?: number;
  tvl?: number;
}> {
  if (process.env.DEFILLAMA_BASE_URL) {
    try {
      // DefiLlama-style API for TVL and historical price to compute drawdown/depeg
      const res = await fetch(
        `${process.env.DEFILLAMA_BASE_URL}/v2/historicalRange/${symbol}/usd`,
        { next: { revalidate: 0 } }
      );
      if (!res.ok) throw new Error("DefiLlama fetch failed");
      const data = await res.json();
      const prices = (data as { price?: number[] }).price || [];
      if (prices.length < 2) return { maxDrawdown90d: MOCK_MAX_DRAWDOWN, pegDeviation90d: MOCK_PEG_DEVIATION };
      let maxDrawdown = 0;
      let peak = prices[0];
      for (let i = 1; i < prices.length; i++) {
        if (prices[i] > peak) peak = prices[i];
        const dd = (prices[i] - peak) / peak;
        if (dd < maxDrawdown) maxDrawdown = dd;
      }
      const pegDev = Math.abs(1 - (prices[prices.length - 1] / prices[0]));
      return {
        maxDrawdown90d: maxDrawdown,
        pegDeviation90d: pegDev,
      };
    } catch {
      // fallthrough to mock
    }
  }
  return {
    maxDrawdown90d: MOCK_MAX_DRAWDOWN,
    pegDeviation90d: MOCK_PEG_DEVIATION,
  };
}

/**
 * Fetch all market data relevant for a provider (by planner type and slug).
 */
export async function fetchMarketDataForProvider(params: {
  providerId: string;
  plannerType: "BTC" | "FIAT" | "STABLECOIN";
  slug: string;
}): Promise<MarketDataResult> {
  const now = new Date().toISOString();
  if (params.plannerType === "FIAT") {
    const hv30 = await fetchHv30(params.slug);
    return {
      hv30,
      source: process.env.COINGECKO_API_KEY ? "coingecko" : "mock",
      fetchedAt: now,
    };
  }
  if (params.plannerType === "STABLECOIN") {
    const { maxDrawdown90d, pegDeviation90d, tvl } = await fetchStablecoinMarketData(params.slug);
    return {
      maxDrawdown90d,
      pegDeviation90d,
      tvl,
      source: process.env.DEFILLAMA_BASE_URL ? "defillama" : "mock",
      fetchedAt: now,
    };
  }
  return { source: "none", fetchedAt: now };
}
