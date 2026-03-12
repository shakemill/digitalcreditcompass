"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PlannerType } from "@/types/yieldboard";
import { getYieldBoardRows } from "@/data/yieldboard-mock";
import {
  getYieldBoardRowsFromApi,
  getCompareProvidersFromApi,
} from "@/lib/yield-board/getYieldBoardRowsFromApi";
import type { YieldBoardRow } from "@/types/yieldboard";

const VALID_TYPES: PlannerType[] = ["btc", "stablecoin", "fiat"];
const TAB_COLORS: Record<PlannerType, string> = {
  btc: "#F29C22",
  stablecoin: "#0891B2",
  fiat: "#4F46E5",
};

function formatVerified(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso.slice(0, 10);
  }
}

function getCompareRows(plannerType: PlannerType): { label: string; getValue: (r: YieldBoardRow) => string }[] {
  const base: { label: string; getValue: (r: YieldBoardRow) => string }[] = [
    { label: "Provider", getValue: (r: YieldBoardRow) => (r.ticker ? `${r.name} (${r.ticker})` : r.name) },
    { label: "DCC Score", getValue: (r: YieldBoardRow) => `${r.dccScore}` },
    { label: "Risk Band", getValue: (r: YieldBoardRow) => r.riskBand },
    {
      label: plannerType === "btc" ? "APY Range" : "APY / Yield",
      getValue: (r: YieldBoardRow) =>
        r.apyMin != null && r.apyMax != null
          ? `${(r.apyMin * 100).toFixed(1)}–${(r.apyMax * 100).toFixed(1)}%`
          : "—",
    },
  ];
  if (plannerType === "btc") {
    return [
      ...base,
      { label: "Max LTV", getValue: (r: YieldBoardRow) => (r.maxLtv != null ? `${r.maxLtv}%` : "—") },
      { label: "Liquidation LTV", getValue: (r: YieldBoardRow) => (r.liquidationLtv != null ? `${r.liquidationLtv}%` : "—") },
      { label: "Rehypothecation", getValue: (r: YieldBoardRow) => (r.rehypothecation ? "Yes" : "No") },
      { label: "Score Verified", getValue: (r: YieldBoardRow) => formatVerified(r.scoreVerifiedAt) },
    ];
  }
  if (plannerType === "stablecoin") {
    return [
      ...base,
      { label: "Stablecoin & Peg", getValue: (r: YieldBoardRow) => `${r.stablecoin ?? "—"} ${r.pegType ?? ""}`.trim() },
      {
        label: "90d Depeg",
        getValue: (r: YieldBoardRow) => (r.maxDepeg90d != null ? `${(r.maxDepeg90d * 100).toFixed(2)}%` : "—"),
      },
      { label: "Withdrawal", getValue: (r: YieldBoardRow) => r.withdrawalSpeed ?? "—" },
      { label: "Score Verified", getValue: (r: YieldBoardRow) => formatVerified(r.scoreVerifiedAt) },
    ];
  }
  return [
    ...base,
    { label: "HV30", getValue: (r: YieldBoardRow) => (r.hv30 != null ? `${(r.hv30 * 100).toFixed(0)}%` : "—") },
    { label: "Income Type", getValue: (r: YieldBoardRow) => r.incomeType ?? "—" },
    { label: "Seniority", getValue: (r: YieldBoardRow) => r.seniority ?? "—" },
    { label: "Score Verified", getValue: (r: YieldBoardRow) => formatVerified(r.scoreVerifiedAt) },
  ];
}

export default function YieldBoardComparePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const type = (VALID_TYPES.includes(params?.type as PlannerType) ? params.type : "btc") as PlannerType;
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : [];

  const [allRows, setAllRows] = useState<YieldBoardRow[]>(() => getYieldBoardRows(type));
  const [compareProviders, setCompareProviders] = useState<YieldBoardRow[]>([]);
  useEffect(() => {
    getYieldBoardRowsFromApi(type).then(setAllRows);
  }, [type]);
  useEffect(() => {
    if (ids.length >= 2 && ids.length <= 4) {
      getCompareProvidersFromApi(type, ids).then(setCompareProviders);
    } else {
      setCompareProviders([]);
    }
  }, [type, ids.join(",")]);
  const providers =
    ids.length >= 2 && ids.length <= 4
      ? compareProviders
      : allRows.filter((r) => ids.includes(r.id));
  const compareRows = getCompareRows(type);
  const color = TAB_COLORS[type];

  if (providers.length === 0) {
    return (
      <div className="min-h-full bg-[#F5F2ED] p-6 lg:p-8">
        <Link
          href={`/yield-boards/${type}`}
          className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Yield Board
        </Link>
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <h1 className="font-heading text-xl font-semibold text-gray-900">Compare providers</h1>
          <p className="mt-2 text-sm text-gray-600">
            No providers selected. Select two or more providers on the Yield Board and open the comparison.
          </p>
          <Link
            href={`/yield-boards/${type}`}
            className="mt-6 inline-block rounded-lg bg-gray-900 px-4 py-2 font-mono text-sm font-medium text-white hover:bg-gray-800"
          >
            Go to Yield Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F5F2ED] p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/yield-boards/${type}`}
          className="inline-flex items-center gap-2 font-mono text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Yield Board
        </Link>
        <span
          className="rounded-full px-3 py-1 font-mono text-xs font-medium uppercase"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {type}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <header className="border-b border-gray-200 px-6 py-4">
          <h1 className="font-heading text-xl font-semibold tracking-tight text-gray-900">
            Compare providers
          </h1>
          <p className="mt-1 font-mono text-xs text-gray-500">
            {providers.length} provider{providers.length > 1 ? "s" : ""} selected
          </p>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="w-40 px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider text-gray-500">
                  Criteria
                </th>
                {providers.map((p) => (
                  <th
                    key={p.id}
                    className="min-w-[140px] border-l border-gray-100 px-4 py-3 text-left font-semibold text-gray-900"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden
                      />
                      {p.ticker ? `${p.name} (${p.ticker})` : p.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b border-gray-100 ${i % 2 === 1 ? "bg-gray-100" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-500">
                    {row.label}
                  </td>
                  {providers.map((p) => (
                    <td
                      key={p.id}
                      className="border-l border-gray-100 px-4 py-3 text-sm text-gray-900"
                    >
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
