"use client";

import { useEffect, useState } from "react";
import { YieldBoardTable } from "./YieldBoardTable";
import type { PlannerType, YieldBoardRow } from "@/types/yieldboard";

type ProviderRowData = {
  id: string;
  name: string;
  slug: string;
  plannerType: string;
  finalScore: number;
  riskBand: "LOW" | "MEDIUM" | "ELEVATED" | "HIGH";
  apyMin?: number | null;
  apyMax?: number | null;
};

function toYieldBoardRow(p: ProviderRowData, index: number, plannerType: PlannerType): YieldBoardRow {
  return {
    id: p.id,
    rank: index + 1,
    name: p.name,
    plannerType,
    dccScore: p.finalScore,
    riskBand: p.riskBand,
    apyMin: p.apyMin ?? null,
    apyMax: p.apyMax ?? null,
    scoreVerifiedAt: new Date().toISOString(),
  };
}

export function YieldBoardClient({
  type,
}: {
  type: string;
}) {
  const [providers, setProviders] = useState<ProviderRowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/yield-board/${type}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.providers) {
          setProviders(data.providers);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  if (loading) {
    return (
      <p className="mt-4 font-mono text-sm text-text-muted">
        Loading…
      </p>
    );
  }

  const plannerType = type === "btc" || type === "stablecoin" || type === "fiat" ? type : "btc";
  const rows: YieldBoardRow[] = providers.map((p, i) => toYieldBoardRow(p, i, plannerType));

  return (
    <YieldBoardTable
      rows={rows}
      plannerType={plannerType}
    />
  );
}
