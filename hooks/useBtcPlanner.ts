"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { computeBtcPlanner, getBtcScenarios } from "@/lib/planner/btc";
import { getDurationMultiplier } from "@/lib/scoring/engine";
import { getYieldBoardRows } from "@/data/yieldboard-mock";
import { getYieldBoardRowsFromApi } from "@/lib/yield-board/getYieldBoardRowsFromApi";
import type { YieldBoardRow } from "@/types/yieldboard";

export interface BtcPlannerState {
  totalNeed12m: number;
  apr: number;
  btcPrice: number;
  ltv: number;
  durationMonths: number;
  liquidationLtv: number;
}

function riskBandFromLtv(ltv: number): "GREEN" | "AMBER" | "RED" {
  if (ltv <= 0.5) return "GREEN";
  if (ltv <= 0.75) return "AMBER";
  return "RED";
}

const DEFAULT_STATE: BtcPlannerState = {
  totalNeed12m: 120000,
  apr: 0,
  btcPrice: 97400,
  ltv: 50,
  durationMonths: 12,
  liquidationLtv: 85,
};

const DURATION_OPTIONS = [1, 3, 6, 12, 24, 36] as const;

/** Format APY for planner from yield board row (dccScore = raw score). */
function formatApyFromRow(apyMin: number | null, apyMax: number | null, custody?: boolean): string {
  if (custody || (apyMin == null && apyMax == null)) return "—";
  const min = apyMin != null ? (apyMin * 100).toFixed(1) : "—";
  const max = apyMax != null ? (apyMax * 100).toFixed(1) : "—";
  return `${min}–${max}%`;
}

/** APY in % for interest calculation: midpoint of range, or 0 for custody. */
function apyPercentFromRow(apyMin: number | null, apyMax: number | null, custody?: boolean): number {
  if (custody || (apyMin == null && apyMax == null)) return 0;
  const min = apyMin ?? 0;
  const max = apyMax ?? 0;
  return (min + max) / 2 * 100;
}

/** Min/max APY in % (null for custody). Enables min/max interest range. */
function apyRangeFromRow(
  apyMin: number | null,
  apyMax: number | null,
  custody?: boolean
): { apyMinPercent: number | null; apyMaxPercent: number | null } {
  if (custody || (apyMin == null && apyMax == null))
    return { apyMinPercent: null, apyMaxPercent: null };
  return {
    apyMinPercent: apyMin != null ? Math.round(apyMin * 1000) / 10 : null,
    apyMaxPercent: apyMax != null ? Math.round(apyMax * 1000) / 10 : null,
  };
}

export function useBtcPlanner() {
  const [state, setState] = useState<BtcPlannerState>(DEFAULT_STATE);
  const [selectedProviderName, setSelectedProviderNameState] = useState<string | null>(null);
  const [btcRows, setBtcRows] = useState<YieldBoardRow[]>(() => getYieldBoardRows("btc"));

  useEffect(() => {
    getYieldBoardRowsFromApi("btc").then(setBtcRows);
  }, []);

  const setField = useCallback(
    <K extends keyof BtcPlannerState>(key: K, value: BtcPlannerState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setSelectedProvider = useCallback((name: string | null) => {
    setSelectedProviderNameState((prev) => (prev === name ? null : name));
  }, []);

  const adjustedProviders = useMemo(() => {
    const mult = getDurationMultiplier(state.durationMonths);
    const top5 = btcRows.slice(0, 5);
    return top5.map((row) => {
      const range = apyRangeFromRow(row.apyMin, row.apyMax, row.custody);
      return {
        name: row.name,
        type: row.riskBand,
        score: row.dccScore,
        adjustedScore: parseFloat((row.dccScore * mult).toFixed(1)),
        apy: formatApyFromRow(row.apyMin, row.apyMax, row.custody),
        apyPercent: apyPercentFromRow(row.apyMin, row.apyMax, row.custody),
        apyMinPercent: range.apyMinPercent,
        apyMaxPercent: range.apyMaxPercent,
        multiplier: mult,
        criteriaBreakdown: row.criteriaBreakdown,
      };
    });
  }, [state.durationMonths, btcRows]);

  const effectiveApr = useMemo(() => {
    if (selectedProviderName) {
      const p = adjustedProviders.find((x) => x.name === selectedProviderName);
      return p ? p.apyPercent : state.apr;
    }
    return state.apr;
  }, [selectedProviderName, adjustedProviders, state.apr]);

  const baseInputs = useMemo(
    () => ({
      totalNeed12m: state.totalNeed12m,
      btcPrice: state.btcPrice,
      ltv: state.ltv / 100,
      liquidationLtv: state.liquidationLtv / 100,
      durationMonths: state.durationMonths,
    }),
    [state.totalNeed12m, state.btcPrice, state.ltv, state.liquidationLtv, state.durationMonths]
  );

  const result = useMemo(
    () =>
      computeBtcPlanner({
        ...baseInputs,
        apr: effectiveApr,
      }),
    [baseInputs, effectiveApr]
  );

  const resultMin = useMemo(() => {
    const p = selectedProviderName ? adjustedProviders.find((x) => x.name === selectedProviderName) : null;
    if (p?.apyMinPercent == null) return null;
    return computeBtcPlanner({ ...baseInputs, apr: p.apyMinPercent });
  }, [selectedProviderName, adjustedProviders, baseInputs]);

  const resultMax = useMemo(() => {
    const p = selectedProviderName ? adjustedProviders.find((x) => x.name === selectedProviderName) : null;
    if (p?.apyMaxPercent == null) return null;
    return computeBtcPlanner({ ...baseInputs, apr: p.apyMaxPercent });
  }, [selectedProviderName, adjustedProviders, baseInputs]);

  const hasInterestRange =
    resultMin != null && resultMax != null && resultMin.totalInterest !== resultMax.totalInterest;

  const selectedProvider = useMemo(
    () => (selectedProviderName ? adjustedProviders.find((p) => p.name === selectedProviderName) ?? null : null),
    [selectedProviderName, adjustedProviders]
  );

  const scenarioRows = useMemo(() => {
    return getBtcScenarios(state.totalNeed12m, state.btcPrice).map((s) => ({
      ltv: s.ltv,
      btcRequired: s.btcRequired,
      liquidationPrice: s.liquidationPrice,
      sri: s.sri,
      riskBand: riskBandFromLtv(s.ltv / 100),
    }));
  }, [state.totalNeed12m, state.btcPrice]);

  const multiplier = useMemo(
    () => getDurationMultiplier(state.durationMonths),
    [state.durationMonths]
  );

  return {
    state,
    setField,
    result,
    resultMin,
    resultMax,
    hasInterestRange,
    scenarioRows,
    durationOptions: DURATION_OPTIONS,
    multiplier,
    adjustedProviders,
    selectedProviderName,
    setSelectedProvider,
    selectedProvider,
    effectiveApr,
    saveScenario: () => {},
  };
}