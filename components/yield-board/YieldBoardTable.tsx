"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  Building2,
  Award,
  Percent,
  CalendarCheck,
  GitCompare,
  Scale,
  Shield,
  TrendingUp,
  Wallet,
  XCircle,
  CircleDollarSign,
} from "lucide-react";
import type { PlannerType, YieldBoardRow } from "@/types/yieldboard";
import { YieldBoardRow as YieldBoardRowComponent } from "./YieldBoardRow";

const STALE_7_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const STALE_60_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

function isStale7d(scoreVerifiedAt: string): boolean {
  const t = new Date(scoreVerifiedAt).getTime();
  return Date.now() - t > STALE_7_DAYS_MS;
}

function isStale60d(scoreVerifiedAt: string): boolean {
  const t = new Date(scoreVerifiedAt).getTime();
  return Date.now() - t > STALE_60_DAYS_MS;
}

function formatVerified(iso: string): string {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso.slice(0, 10);
  }
}

type ColDef = {
  id: string;
  label: string;
  align: "left" | "center" | "right";
  width?: string;
  weight?: number; // used to compute % width when avoiding horizontal scroll
  alwaysShow?: boolean;
};

// Weights used to compute column widths as % (no horizontal scroll)
// BTC: [chevron] | Provider | DCC Score | APY Range | Max LTV | Liquidation LTV | Rehypothecation | Score Verified | Compare
const BTC_COLS: ColDef[] = [
  { id: "chevron", label: "", align: "left", weight: 0.5, alwaysShow: true },
  { id: "provider", label: "Provider", align: "left", weight: 2.5 },
  { id: "dccScore", label: "DCC Score", align: "left", weight: 1.2 },
  { id: "apyRange", label: "APY Range", align: "left", weight: 1.2 },
  { id: "maxLtv", label: "Max LTV", align: "left", weight: 1 },
  { id: "liquidationLtv", label: "Liquidation LTV", align: "left", weight: 1.2 },
  { id: "rehypothecation", label: "Rehypothecation", align: "left", weight: 1.2 },
  { id: "scoreVerified", label: "Score Verified", align: "left", weight: 1 },
  { id: "compare", label: "Compare", align: "center", weight: 0.5, alwaysShow: true },
];

const STABLECOIN_COLS: ColDef[] = [
  { id: "provider", label: "Provider", align: "left", weight: 2.5 },
  { id: "type", label: "Type", align: "left", weight: 0.8 },
  { id: "dccScore", label: "DCC Score", align: "left", weight: 1.2 },
  { id: "apy", label: "APY", align: "left", weight: 1 },
  { id: "stablecoinPeg", label: "Stablecoin & Peg", align: "left", weight: 1.5 },
  { id: "depeg90d", label: "90d Depeg", align: "left", weight: 1 },
  { id: "withdrawal", label: "Withdrawal", align: "left", weight: 1 },
  { id: "scoreVerified", label: "Score Verified", align: "left", weight: 1 },
  { id: "compare", label: "Compare", align: "center", weight: 0.5, alwaysShow: true },
];

const FIAT_COLS: ColDef[] = [
  { id: "instrument", label: "Instrument", align: "left", weight: 2.5 },
  { id: "stabilityScore", label: "Stability Score", align: "left", weight: 1.2 },
  { id: "yieldRange", label: "Yield Range", align: "left", weight: 1.2 },
  { id: "hv30", label: "HV30", align: "left", weight: 0.8 },
  { id: "incomeType", label: "Income Type", align: "left", weight: 1 },
  { id: "seniority", label: "Seniority", align: "left", weight: 1 },
  { id: "scoreVerified", label: "Score Verified", align: "left", weight: 1 },
  { id: "compare", label: "Compare", align: "center", weight: 0.5, alwaysShow: true },
];

/** Column options for the column picker (toggleable only, per planner type) */
export function getColumnOptionsForPicker(plannerType: PlannerType): { id: string; label: string }[] {
  const cols = plannerType === "btc" ? BTC_COLS : plannerType === "stablecoin" ? STABLECOIN_COLS : FIAT_COLS;
  return cols.filter((c) => !c.alwaysShow).map((c) => ({ id: c.id, label: c.label }));
}

export function YieldBoardTable({
  rows,
  plannerType,
  columnVisibility = {},
}: {
  rows: YieldBoardRow[];
  plannerType: PlannerType;
  columnVisibility?: Record<string, boolean>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => b.dccScore - a.dccScore);
  }, [rows]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const compareRows = useMemo(
    () => sortedRows.filter((r) => compareIds.has(r.id)),
    [sortedRows, compareIds]
  );

  const allCols =
    plannerType === "btc"
      ? BTC_COLS
      : plannerType === "stablecoin"
        ? STABLECOIN_COLS
        : FIAT_COLS;

  const cols = useMemo(
    () =>
      allCols.filter(
        (c) => c.alwaysShow || columnVisibility[c.id] !== false
      ),
    [allCols, columnVisibility]
  );

  const visibleColumnIds = useMemo(() => cols.map((c) => c.id), [cols]);
  const colCount = cols.length;

  const totalWeight = useMemo(
    () => cols.reduce((s, c) => s + (c.weight ?? 1), 0),
    [cols]
  );

  const alignClass = (align: ColDef["align"]) =>
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const isBtc = plannerType === "btc";

  const headerIcon: Record<string, React.ReactNode> = {
    "": null,
    Provider: <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    Instrument: <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "DCC Score": <Award className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Stability Score": <Award className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "APY Range": <Percent className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    APY: <Percent className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Yield Range": <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Max LTV": <Scale className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Liquidation LTV": <Shield className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    Rehypothecation: <Wallet className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Score Verified": <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    Compare: <GitCompare className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Stablecoin & Peg": <CircleDollarSign className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "90d Depeg": <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    Withdrawal: <Wallet className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    HV30: <TrendingUp className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    "Income Type": <Percent className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
    Seniority: <Award className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />,
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {sortedRows.length > 0 ? (
        <>
          <div className="min-w-0 overflow-hidden">
            <table className="w-full min-w-0 border-collapse" style={{ tableLayout: "fixed" }}>
              <colgroup>
                {cols.map((col) => {
                  const pct = totalWeight > 0 ? ((col.weight ?? 1) / totalWeight) * 100 : 100 / cols.length;
                  return <col key={col.id} style={{ width: `${pct}%` }} />;
                })}
              </colgroup>
              <thead>
                <tr className="border-b border-gray-200">
                  {cols.map((col) => (
                    <th
                      key={col.id}
                      className={`min-w-0 overflow-hidden px-3 py-2 text-left text-xs font-medium text-gray-500 ${alignClass(col.align)}`}
                    >
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 truncate">
                        {headerIcon[col.label]}
                        {isBtc && col.label === "DCC Score" ? (
                          <>
                            {col.label}
                            <span className="shrink-0 text-gray-400" aria-label="Sorted descending">↓</span>
                          </>
                        ) : (
                          <span className="truncate">{col.label}</span>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, index) => (
                  <YieldBoardRowComponent
                    key={row.id}
                    row={row}
                    plannerType={plannerType}
                    isExpanded={expandedId === row.id}
                    onToggle={() =>
                      setExpandedId((id) => (id === row.id ? null : row.id))
                    }
                    isStale7d={isStale7d(row.scoreVerifiedAt)}
                    isStale60d={isStale60d(row.scoreVerifiedAt)}
                    colSpan={colCount}
                    columnAlignments={cols.map((c) => c.align)}
                    rowIndex={index}
                    isBtcTable={isBtc}
                    isInCompare={compareIds.has(row.id)}
                    onToggleCompare={() => toggleCompare(row.id)}
                    visibleColumnIds={visibleColumnIds}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {compareRows.length >= 2 && (
          <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-4">
            <h3 className="mb-3 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-gray-600">
              <GitCompare className="h-4 w-4 shrink-0" aria-hidden />
              Compare ({compareRows.length} selected)
            </h3>
            <div className="min-w-0 overflow-hidden">
              <table className="w-full min-w-0 border-collapse text-xs" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Provider</th>
                    <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">DCC Score</th>
                    <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">
                      {plannerType === "btc" ? "APY Range" : "APY / Yield"}
                    </th>
                    {isBtc && (
                      <>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Max LTV</th>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Liq. LTV</th>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Rehypo</th>
                      </>
                    )}
                    {plannerType === "stablecoin" && (
                      <>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Stablecoin</th>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">90d Depeg</th>
                      </>
                    )}
                    {plannerType === "fiat" && (
                      <>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">HV30</th>
                        <th className="min-w-0 max-w-0 truncate py-2 pr-4 font-medium">Seniority</th>
                      </>
                    )}
                    <th className="min-w-0 max-w-0 truncate py-2 font-medium">Verified</th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="max-w-0 min-w-0 truncate py-2 pr-4 font-medium text-gray-900">
                        {r.ticker ? `${r.name} (${r.ticker})` : r.name}
                      </td>
                      <td className="min-w-0 max-w-0 overflow-hidden py-2 pr-4">
                        <span className="font-semibold tabular-nums">{r.dccScore}</span>
                        <span className="ml-1 text-gray-500">{r.riskBand}</span>
                      </td>
                      <td className="min-w-0 max-w-0 truncate py-2 pr-4 tabular-nums">
                        {r.apyMin != null && r.apyMax != null
                          ? `${(r.apyMin * 100).toFixed(1)}–${(r.apyMax * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                      {isBtc && (
                        <>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4 tabular-nums">{r.maxLtv != null ? `${r.maxLtv}%` : "—"}</td>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4 tabular-nums">{r.liquidationLtv != null ? `${r.liquidationLtv}%` : "—"}</td>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4">{r.rehypothecation ? "Yes" : "No"}</td>
                        </>
                      )}
                      {plannerType === "stablecoin" && (
                        <>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4">{r.stablecoin ?? "—"} {r.pegType ?? ""}</td>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4 tabular-nums">
                            {r.maxDepeg90d != null ? `${(r.maxDepeg90d * 100).toFixed(2)}%` : "—"}
                          </td>
                        </>
                      )}
                      {plannerType === "fiat" && (
                        <>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4 tabular-nums">{r.hv30 != null ? `${(r.hv30 * 100).toFixed(0)}%` : "—"}</td>
                          <td className="min-w-0 max-w-0 truncate py-2 pr-4">{r.seniority ?? "—"}</td>
                        </>
                      )}
                      <td className="min-w-0 max-w-0 truncate py-2 text-gray-500 tabular-nums">
                        {formatVerified(r.scoreVerifiedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCompareIds(new Set())}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Clear comparison
              </button>
              <Link
                href={`/yield-boards/${plannerType}/compare?ids=${[...compareIds].join(",")}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Open in new page
              </Link>
            </div>
          </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-300" aria-hidden />
          <h2 className="mt-4 font-heading text-lg font-semibold text-gray-700">
            No providers for {plannerType}
          </h2>
          <p className="mt-2 max-w-sm mx-auto font-sans text-sm text-gray-500">
            There are no entries in this category yet. Switch to another tab or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
