"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { computeFiatProjections } from "@/lib/planner/fiat";
import { HARD_RULES } from "@/lib/scoring/weights";
import { getDurationMultiplier } from "@/lib/scoring/engine";
import { getYieldBoardRows } from "@/data/yieldboard-mock";
import { getYieldBoardRowsFromApi } from "@/lib/yield-board/getYieldBoardRowsFromApi";
import type { YieldBoardRow } from "@/types/yieldboard";

export interface FiatInstrument {
  ticker: string;
  name: string;
  dccScore: number;
  apyEstimate: number;
  hv30: number;
  riskBand: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
  disabled?: boolean;
}

export interface FiatPlannerState {
  capital: number;
  durationMonths: number;
  mode: "guided" | "custom";
  selectedTickers: string[];
  customWeights: Record<string, number>;
}

function instrumentsFromRows(rows: YieldBoardRow[]): FiatInstrument[] {
  return rows.slice(0, 5).map((row) => ({
    ticker: row.ticker ?? row.name,
    name: row.name,
    dccScore: row.dccScore,
    apyEstimate: row.apyMin != null && row.apyMax != null
      ? Math.round(((row.apyMin + row.apyMax) / 2) * 1000) / 10
      : 0,
    hv30: Math.round((row.hv30 ?? 0) * 100),
    riskBand: row.riskBand,
  }));
}

const GUIDED_TOP_N = 3;
/** Modelled mode: first 60%, second 20%, third 20%. */
const GUIDED_WEIGHTS_PCT = [60, 20, 20];
const DEFAULT_STATE: FiatPlannerState = {
  capital: 250000,
  durationMonths: 12,
  mode: "guided",
  selectedTickers: [],
  customWeights: {},
};

export function useFiatPlanner() {
  const [state, setState] = useState<FiatPlannerState>(DEFAULT_STATE);
  const [fiatRows, setFiatRows] = useState<YieldBoardRow[]>(() => getYieldBoardRows("fiat"));
  useEffect(() => {
    getYieldBoardRowsFromApi("fiat").then(setFiatRows);
  }, []);
  const instruments = useMemo(() => instrumentsFromRows(fiatRows), [fiatRows]);

  const setField = useCallback(
    <K extends keyof FiatPlannerState>(key: K, value: FiatPlannerState[K]) => {
      setState((prev) => {
        const next = { ...prev, [key]: value };
        if (key === "mode" && value === "custom") {
          const top3Tickers = instruments
            .map((i) => ({ ticker: i.ticker, adj: i.dccScore * getDurationMultiplier(prev.durationMonths) }))
            .sort((a, b) => b.adj - a.adj)
            .slice(0, GUIDED_TOP_N)
            .map((x) => x.ticker);
          if (prev.selectedTickers.length === 0 && top3Tickers.length > 0) {
            next.selectedTickers = top3Tickers;
          }
        }
        return next;
      });
    },
    [instruments]
  );

  const toggleInstrument = useCallback((ticker: string) => {
    setState(prev => ({
      ...prev,
      selectedTickers: prev.selectedTickers.includes(ticker)
        ? prev.selectedTickers.filter(t => t !== ticker)
        : [...prev.selectedTickers, ticker],
    }));
  }, []);

  const setCustomWeight = useCallback((ticker: string, pct: number) => {
    setState(prev => ({
      ...prev,
      customWeights: { ...prev.customWeights, [ticker]: pct },
    }));
  }, []);

  useEffect(() => {
    setState(prev => {
      if (prev.mode !== "custom" || prev.selectedTickers.length === 0)
        return prev;
      const tickers = prev.selectedTickers;
      const n = tickers.length;
      const equalPct = Math.floor(100 / n);
      const remainder = 100 - equalPct * n;
      const next: Record<string, number> = { ...prev.customWeights };
      let needUpdate = false;
      tickers.forEach((t, i) => {
        const want = i === tickers.length - 1 ? equalPct + remainder : equalPct;
        if (next[t] === undefined) {
          next[t] = want;
          needUpdate = true;
        }
      });
      for (const t of Object.keys(next)) {
        if (!tickers.includes(t)) {
          delete next[t];
          needUpdate = true;
        }
      }
      return needUpdate ? { ...prev, customWeights: next } : prev;
    });
  }, [state.mode, state.selectedTickers.join(",")]);

  const mult = useMemo(
    () => getDurationMultiplier(state.durationMonths),
    [state.durationMonths]
  );

  const guidedTop3 = useMemo(() => {
    const withAdj = instruments.map((i) => ({
      ...i,
      adjustedScore: i.dccScore * mult,
    }));
    return withAdj
      .sort((a, b) => b.adjustedScore - a.adjustedScore)
      .slice(0, GUIDED_TOP_N);
  }, [instruments, mult]);

  const selectedInstruments = useMemo(
    () =>
      state.mode === "guided"
        ? guidedTop3
        : instruments.filter((i) => state.selectedTickers.includes(i.ticker)),
    [state.mode, guidedTop3, instruments, state.selectedTickers]
  );

  const guidedWeights = useMemo(() => {
    if (state.mode !== "guided" || guidedTop3.length === 0) return {};
    return Object.fromEntries(
      guidedTop3.map((inst, i) => [
        inst.ticker,
        GUIDED_WEIGHTS_PCT[i] ?? 0,
      ])
    );
  }, [state.mode, guidedTop3]);

  // Blended APY Range: min–max of selected instruments' APYs (interval, not weighted average)
  const blendedApy = useMemo(() => {
    if (selectedInstruments.length === 0) return { min: 0, max: 0 };
    const apys = selectedInstruments.map((i) => i.apyEstimate);
    return {
      min: Math.min(...apys),
      max: Math.max(...apys),
    };
  }, [selectedInstruments]);

  const projectedIncome = useMemo(() => {
    if (state.capital <= 0 || selectedInstruments.length === 0) return null;
    return computeFiatProjections(
      state.capital,
      blendedApy.min,
      blendedApy.max,
      state.durationMonths
    );
  }, [state.capital, blendedApy, state.durationMonths]);

  const adjustedScores = useMemo(() => {
    return selectedInstruments.map((i) => ({
      ...i,
      adjustedScore: parseFloat((i.dccScore * mult).toFixed(1)),
      multiplier: mult,
    }));
  }, [selectedInstruments, mult]);

  const weightsTotal = useMemo(
    () =>
      state.mode === "custom"
        ? selectedInstruments.reduce(
            (sum, i) => sum + (state.customWeights[i.ticker] ?? 0),
            0
          )
        : selectedInstruments.reduce(
            (sum, i) => sum + (guidedWeights[i.ticker] ?? 0),
            0
          ),
    [state.mode, state.customWeights, selectedInstruments, guidedWeights]
  );

  const hv30Warning = useMemo(
    () => selectedInstruments.some(i => i.hv30 > HARD_RULES.HV30_FIAT_CAP_THRESHOLD),
    [selectedInstruments]
  );

  const effectiveWeights = state.mode === "guided" ? guidedWeights : state.customWeights;

  return {
    state,
    setField,
    toggleInstrument,
    setCustomWeight,
    instruments,
    selectedInstruments,
    adjustedScores,
    blendedApy,
    projectedIncome,
    hv30Warning,
    weightsTotal,
    effectiveWeights,
    guidedWeights,
  };
}