"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface BtcScenarioSnapshot {
  module: "1A";
  inputs: {
    totalNeed12m: number;
    btcPrice: number;
    apr: number;
    ltv: number;
    durationMonths: number;
    liquidationLtv: number;
  };
  results: {
    btcRequired: number;
    monthlyTarget: number;
    marginCallPrice: number;
    liquidationPrice: number;
    totalInterest: number;
    totalCost: number;
    sri: number;
    riskBand: string;
    collateralUSD: number;
  };
  yieldBoard: Array<{
    name: string;
    score: number;
    adjustedScore: number;
    apy: string;
    multiplier: number;
  }>;
  selectedProviderName?: string;
  selectedProviderApy?: string;
  selectedProviderApyMin?: number;
  selectedProviderApyMax?: number;
  selectedProviderCriteria?: Record<string, number>;
  savedAt: string;
}

export interface FiatScenarioSnapshot {
  module: "1B";
  inputs: {
    capital: number;
    durationMonths: number;
    mode: string;
    selectedTickers: string[];
  };
  results: {
    annualMin: number;
    annualMax: number;
    monthlyMin: number;
    monthlyMax: number;
    totalMin: number;
    totalMax: number;
  };
  instruments: Array<{
    ticker: string;
    name: string;
    dccScore: number;
    adjustedScore: number;
    multiplier: number;
    apyEstimate: number;
    hv30: number;
    riskBand: string;
  }>;
  blendedApy: {
    min: number;
    max: number;
  };
  /** Allocation weight per ticker (e.g. Guided 33.33% each, Modelled user weights). */
  allocationWeights?: Record<string, number>;
  savedAt: string;
}

export interface StablecoinScenarioSnapshot {
  module: "1C";
  inputs: {
    capital: number;
    durationMonths: number;
    mode: string;
    selectedProto: string;
    cefiPct: number;
    defiPct: number;
  };
  results: {
    annualMin: number;
    annualMax: number;
    monthlyMin: number;
    monthlyMax: number;
    totalMin: number;
    totalMax: number;
  };
  providers?: Array<{
    name: string;
    score: number;
    adjustedScore: number;
    apy: string;
    multiplier: number;
    category: "DeFi" | "CeFi";
    weightPct?: number;
  }>;
  savedAt: string;
}

export type ScenarioSnapshot =
  | BtcScenarioSnapshot
  | FiatScenarioSnapshot
  | StablecoinScenarioSnapshot;

export interface ClientInfo {
  clientName: string;
  riskPreference: "Conservative" | "Moderate" | "Aggressive";
}

interface PlannerContextValue {
  snapshots: Record<string, ScenarioSnapshot>;
  saveSnapshot: (snap: ScenarioSnapshot) => void;
  clearSnapshot: (module: string) => void;
  clientInfo: ClientInfo | null;
  setClientInfo: (info: ClientInfo) => void;
}

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [snapshots, setSnapshots] = useState<Record<string, ScenarioSnapshot>>({});
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  const saveSnapshot = useCallback((snap: ScenarioSnapshot) => {
    setSnapshots(prev => ({ ...prev, [snap.module]: snap }));
  }, []);

  const clearSnapshot = useCallback((module: string) => {
    setSnapshots(prev => {
      const next = { ...prev };
      delete next[module];
      return next;
    });
  }, []);

  return (
    <PlannerContext.Provider value={{
      snapshots, saveSnapshot, clearSnapshot,
      clientInfo, setClientInfo,
    }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlannerContext must be used inside PlannerProvider");
  return ctx;
}
