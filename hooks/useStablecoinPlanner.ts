"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import { getDurationMultiplier } from "@/lib/scoring/engine";
import { HARD_RULES } from "@/lib/scoring/weights";
import type { StablecoinPlannerState, StablecoinProto, PegMonitorRow } from "@/types/planner";
import { getYieldBoardRows } from "@/data/yieldboard-mock";
import { getYieldBoardRowsFromApi } from "@/lib/yield-board/getYieldBoardRowsFromApi";
import type { YieldBoardRow } from "@/types/yieldboard";

export interface StablecoinProvider {
  name: string;
  initials: string;
  score: number;
  apy: string;
  apyMin: number;
  apyMax: number;
  color: string;
  category: "DeFi" | "CeFi";
  protocol: string;
  tvl?: string;
  supportedProtos: StablecoinProto[];
  suspended?: boolean;
}

const DEFI_COLOR = "#0891B2";
const CEFI_COLOR = "#7C3AED";

function rowToProvider(row: YieldBoardRow): StablecoinProvider {
  const category = row.category ?? "DeFi";
  const apyMin = row.apyMin != null ? Math.round(row.apyMin * 100) : 0;
  const apyMax = row.apyMax != null ? Math.round(row.apyMax * 100) : 0;
  const supportedProtos: StablecoinProto[] = row.stablecoin ? [row.stablecoin as StablecoinProto] : [];
  const initials = row.name.slice(0, 2).toUpperCase();
  return {
    name: row.name,
    initials,
    score: row.dccScore,
    apy: apyMin || apyMax ? `${apyMin}–${apyMax}%` : "—",
    apyMin,
    apyMax,
    color: category === "DeFi" ? DEFI_COLOR : CEFI_COLOR,
    category,
    protocol: row.name,
    supportedProtos,
    suspended: false,
  };
}

/** Top 5 DeFi + top 5 CeFi from yield board for selected proto. */
function providersFromRows(
  rows: YieldBoardRow[],
  selectedProto: StablecoinProto
): { defi: StablecoinProvider[]; cefi: StablecoinProvider[] } {
  const filtered = rows.filter(
    (r) => r.stablecoin === selectedProto && r.category
  );
  const defi = filtered
    .filter((r) => r.category === "DeFi")
    .slice(0, 5)
    .map(rowToProvider);
  const cefi = filtered
    .filter((r) => r.category === "CeFi")
    .slice(0, 5)
    .map(rowToProvider);
  return { defi, cefi };
}

const PROTO_OPTIONS: { value: StablecoinProto; disabled?: boolean; tooltip?: string }[] = [
  { value: "USDC" },
  { value: "USDT" },
];

const PEG_MONITOR_DATA: PegMonitorRow[] = [
  { id: "USDC", name: "USDC", trackPegPct: 100, deviation: 0.002, riskBand: "LOW" },
  { id: "USDT", name: "USDT", trackPegPct: 99.8, deviation: 0.005, riskBand: "LOW" },
];

const CEFI_WEIGHT = 0.7;
const DEFI_WEIGHT = 0.3;

function buildGuidedWeights(providers: StablecoinProvider[]): Record<string, number> {
  const active = providers.filter((p) => !p.suspended);
  if (active.length === 0) return {};
  const equalWeight = parseFloat((100 / active.length).toFixed(1));
  return Object.fromEntries(active.map((p) => [p.name, equalWeight]));
}

/** Guided mode: only the top 1 provider (by adjusted score) gets 100% in each pocket. */
function buildGuidedWeightsTopOne<T extends { name: string; adjustedScore: number }>(
  sortedByAdjustedScore: T[]
): Record<string, number> {
  const top = sortedByAdjustedScore[0];
  return top ? { [top.name]: 100 } : {};
}

const DEFAULT_STATE: StablecoinPlannerState = {
  selectedProto: "USDC",
  capital: 500000,
  durationMonths: 6,
  mode: "guided",
  customDefiPct: 30,
  scenarios: [],
};

export function useStablecoinPlanner() {
  const [state, setState] = useState<StablecoinPlannerState>(DEFAULT_STATE);
  const [customWeightsDefi, setCustomWeightsDefi] = useState<Record<string, number>>({});
  const [customWeightsCefi, setCustomWeightsCefi] = useState<Record<string, number>>({});
  const [stablecoinRows, setStablecoinRows] = useState<YieldBoardRow[]>(() =>
    getYieldBoardRows("stablecoin")
  );

  useEffect(() => {
    getYieldBoardRowsFromApi("stablecoin").then(setStablecoinRows);
  }, []);

  const setField = useCallback(
    <K extends keyof StablecoinPlannerState>(key: K, value: StablecoinPlannerState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const selectProto = useCallback((proto: StablecoinProto) => {
    setState((prev) => ({ ...prev, selectedProto: proto }));
    setCustomWeightsDefi({});
    setCustomWeightsCefi({});
  }, []);

  const multiplier = useMemo(
    () => getDurationMultiplier(state.durationMonths ?? 6),
    [state.durationMonths]
  );

  const { defi: defiProviders, cefi: cefiProviders } = useMemo(
    () => providersFromRows(stablecoinRows, state.selectedProto as StablecoinProto),
    [stablecoinRows, state.selectedProto]
  );

  const adjustedDefi = useMemo(() => {
    const withScore = defiProviders.map((p) => ({
      ...p,
      adjustedScore: parseFloat((p.score * multiplier).toFixed(1)),
      multiplier,
    }));
    return [...withScore].sort((a, b) => b.adjustedScore - a.adjustedScore);
  }, [defiProviders, multiplier]);

  const adjustedCefi = useMemo(() => {
    const withScore = cefiProviders.map((p) => ({
      ...p,
      adjustedScore: parseFloat((p.score * multiplier).toFixed(1)),
      multiplier,
    }));
    return [...withScore].sort((a, b) => b.adjustedScore - a.adjustedScore);
  }, [cefiProviders, multiplier]);

  const weightsDefi = useMemo(() => {
    if (state.mode === "guided") return buildGuidedWeightsTopOne(adjustedDefi);
    return customWeightsDefi;
  }, [state.mode, adjustedDefi, customWeightsDefi]);

  const weightsCefi = useMemo(() => {
    if (state.mode === "guided")
      return buildGuidedWeightsTopOne(adjustedCefi.filter((p) => !p.suspended));
    return customWeightsCefi;
  }, [state.mode, adjustedCefi, customWeightsCefi]);

  // When switching to custom mode, seed with top-1 guided weights if empty
  useEffect(() => {
    if (state.mode !== "custom") return;
    if (Object.keys(customWeightsDefi).length === 0) {
      setCustomWeightsDefi(buildGuidedWeightsTopOne(adjustedDefi));
    }
    if (Object.keys(customWeightsCefi).length === 0) {
      setCustomWeightsCefi(
        buildGuidedWeightsTopOne(adjustedCefi.filter((p) => !p.suspended))
      );
    }
  }, [state.mode, state.selectedProto]); // eslint-disable-line react-hooks/exhaustive-deps

  const sumDefi = useMemo(
    () => Object.values(weightsDefi).reduce((s, v) => s + (v || 0), 0),
    [weightsDefi]
  );
  const sumCefi = useMemo(
    () => Object.values(weightsCefi).reduce((s, v) => s + (v || 0), 0),
    [weightsCefi]
  );
  const defiValid = Math.abs(sumDefi - 100) < 0.5 || sumDefi === 0;
  const cefiValid = Math.abs(sumCefi - 100) < 0.5 || sumCefi === 0;

  const setWeightDefi = useCallback((providerName: string, pct: number) => {
    setCustomWeightsDefi((prev) => ({
      ...prev,
      [providerName]: Math.min(100, Math.max(0, pct)),
    }));
  }, []);
  const setWeightCefi = useCallback((providerName: string, pct: number) => {
    setCustomWeightsCefi((prev) => ({
      ...prev,
      [providerName]: Math.min(100, Math.max(0, pct)),
    }));
  }, []);

  const capital = state.capital ?? 0;
  const activeDefiPctValue =
    state.mode === "guided" ? DEFI_WEIGHT * 100 : Math.min(100, Math.max(0, state.customDefiPct ?? 30));
  const activeCefiPctValue = 100 - activeDefiPctValue;
  const capitalDefi = capital * (activeDefiPctValue / 100);
  const capitalCefi = capital * (activeCefiPctValue / 100);

  const projectedIncome = useMemo(() => {
    if (capital <= 0) return null;
    const dur = state.durationMonths ?? 6;

    let defiAnnualMin = 0,
      defiAnnualMax = 0;
    adjustedDefi.filter((p) => !p.suspended).forEach((p) => {
      const w = (weightsDefi[p.name] ?? 0) / 100;
      defiAnnualMin += capitalDefi * w * (p.apyMin / 100);
      defiAnnualMax += capitalDefi * w * (p.apyMax / 100);
    });

    let cefiAnnualMin = 0,
      cefiAnnualMax = 0;
    adjustedCefi.filter((p) => !p.suspended).forEach((p) => {
      const w = (weightsCefi[p.name] ?? 0) / 100;
      cefiAnnualMin += capitalCefi * w * (p.apyMin / 100);
      cefiAnnualMax += capitalCefi * w * (p.apyMax / 100);
    });

    const annualMin = defiAnnualMin + cefiAnnualMin;
    const annualMax = defiAnnualMax + cefiAnnualMax;

    const defiApyMin = adjustedDefi
      .filter((p) => !p.suspended)
      .reduce((s, p) => s + ((weightsDefi[p.name] ?? 0) / 100) * p.apyMin, 0);
    const defiApyMax = adjustedDefi
      .filter((p) => !p.suspended)
      .reduce((s, p) => s + ((weightsDefi[p.name] ?? 0) / 100) * p.apyMax, 0);
    const cefiApyMin = adjustedCefi
      .filter((p) => !p.suspended)
      .reduce((s, p) => s + ((weightsCefi[p.name] ?? 0) / 100) * p.apyMin, 0);
    const cefiApyMax = adjustedCefi
      .filter((p) => !p.suspended)
      .reduce((s, p) => s + ((weightsCefi[p.name] ?? 0) / 100) * p.apyMax, 0);

    const roundApy = (x: number) => Math.round(x * 10) / 10;
    return {
      annualMin,
      annualMax,
      monthlyMin: annualMin / 12,
      monthlyMax: annualMax / 12,
      totalMin: annualMin * (dur / 12),
      totalMax: annualMax * (dur / 12),
      defi: {
        capital: capitalDefi,
        annualMin: defiAnnualMin,
        annualMax: defiAnnualMax,
        monthlyMin: defiAnnualMin / 12,
        monthlyMax: defiAnnualMax / 12,
        apyMin: roundApy(defiApyMin),
        apyMax: roundApy(defiApyMax),
        weightPct: activeDefiPctValue,
      },
      cefi: {
        capital: capitalCefi,
        annualMin: cefiAnnualMin,
        annualMax: cefiAnnualMax,
        monthlyMin: cefiAnnualMin / 12,
        monthlyMax: cefiAnnualMax / 12,
        apyMin: roundApy(cefiApyMin),
        apyMax: roundApy(cefiApyMax),
        weightPct: activeCefiPctValue,
      },
      durationMonths: dur,
    };
  }, [
    capital,
    capitalDefi,
    capitalCefi,
    activeDefiPctValue,
    activeCefiPctValue,
    adjustedDefi,
    adjustedCefi,
    weightsDefi,
    weightsCefi,
    state.durationMonths,
  ]);

  const activeCefiPct = state.mode === "guided" ? CEFI_WEIGHT * 100 : activeCefiPctValue;
  const activeDefiPct = state.mode === "guided" ? DEFI_WEIGHT * 100 : activeDefiPctValue;

  const setCustomDefiPct = useCallback((pct: number) => {
    setState((prev) => ({
      ...prev,
      customDefiPct: Math.min(100, Math.max(0, pct)),
    }));
  }, []);

  return {
    state,
    setField,
    selectProto,
    protoOptions: PROTO_OPTIONS,
    multiplier,
    projectedIncome,
    algoCap: HARD_RULES.ALGO_STABLECOIN_CAP,
    pegMonitorRows: PEG_MONITOR_DATA,
    adjustedDefi,
    adjustedCefi,
    capitalDefi,
    capitalCefi,
    weightsDefi,
    weightsCefi,
    sumDefi,
    sumCefi,
    defiValid,
    cefiValid,
    setWeightDefi,
    setWeightCefi,
    activeCefiPct,
    activeDefiPct,
    setCustomDefiPct,
  };
}
