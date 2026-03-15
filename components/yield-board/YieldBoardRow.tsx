"use client";

import { ChevronRight, Info } from "lucide-react";
import type { PlannerType, YieldBoardRow as RowType } from "@/types/yieldboard";
import { ScoreBadge } from "./ScoreBadge";
import { RehypoBadge } from "./RehypoBadge";
import { LiquidationLtvCell } from "./LiquidationLtvCell";
import { MaxLtvCell } from "./MaxLtvCell";
import { ApyCell } from "./ApyCell";

function formatVerified(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  } catch {
    return iso.slice(0, 10);
  }
}

const HV30_TOOLTIP =
  "30-day price volatility. Lower = more stable income potential. Updates daily.";

function alignClass(align: "left" | "center" | "right") {
  return align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
}

const BTC_CRITERIA_LABELS: Record<string, string> = {
  transparency: "Transparency",
  collateralControl: "Collateral Control",
  jurisdiction: "Jurisdiction",
  structuralRisk: "Structural Risk",
  trackRecord: "Track Record",
};

const FIAT_CRITERIA_LABELS: Record<string, string> = {
  marketVolatility: "Market Volatility",
  incomeMechanism: "Income Mechanism",
  seniority: "Seniority",
  complexity: "Complexity",
  providerQuality: "Provider Quality",
};

const STABLECOIN_CRITERIA_LABELS: Record<string, string> = {
  reserveQuality: "Reserve Quality",
  yieldTransparency: "Yield Transparency",
  counterpartyRisk: "Counterparty Risk",
  liquidity: "Liquidity",
};

export function YieldBoardRow({
  row,
  plannerType,
  isExpanded,
  onToggle,
  isStale7d,
  isStale60d,
  colSpan,
  columnAlignments,
  rowIndex,
  isBtcTable,
  isInCompare,
  onToggleCompare,
  visibleColumnIds,
}: {
  row: RowType;
  plannerType: PlannerType;
  isExpanded: boolean;
  onToggle: () => void;
  isStale7d?: boolean;
  isStale60d?: boolean;
  colSpan: number;
  columnAlignments: ("left" | "center" | "right")[];
  rowIndex: number;
  isBtcTable?: boolean;
  isInCompare?: boolean;
  onToggleCompare?: () => void;
  visibleColumnIds: string[];
}) {
  const a = (i: number) => alignClass(columnAlignments[i] ?? "left");
  const verifiedDate = formatVerified(row.scoreVerifiedAt);
  const displayName = row.ticker ? `${row.name} (${row.ticker})` : row.name;

  const hv30Pct = row.hv30 != null ? row.hv30 * 100 : null;
  const hv30Color =
    hv30Pct == null
      ? ""
      : hv30Pct < 10
        ? "bg-green-100 text-green-800"
        : hv30Pct <= 25
          ? "bg-amber-100 text-amber-800"
          : "bg-red-100 text-red-800";

  const rowHover = "transition-colors hover:bg-gray-50";
  const rowBorder = "border-b border-gray-100";
  const rowStripe = rowIndex % 2 === 1 ? "bg-gray-100" : "";

  if (isBtcTable && plannerType === "btc") {
    const btcContent: Record<string, React.ReactNode> = {
      chevron: (
        <span
          className={`inline-block text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          aria-hidden
        >
          <ChevronRight className="h-4 w-4 shrink-0" />
        </span>
      ),
      provider: (
        <span className="block min-w-0 truncate text-sm font-semibold text-gray-900" title={displayName}>
          {displayName}
        </span>
      ),
      dccScore: isStale60d ? (
        <span className="text-xs text-gray-300">Under Review</span>
      ) : (
        <ScoreBadge score={row.dccScore} band={row.riskBand} />
      ),
      apyRange: (
        <ApyCell apyMin={row.apyMin} apyMax={row.apyMax} custody={row.custody} />
      ),
      maxLtv: <MaxLtvCell value={row.maxLtv ?? null} />,
      liquidationLtv: <LiquidationLtvCell value={row.liquidationLtv ?? null} />,
      rehypothecation: <RehypoBadge value={row.rehypothecation ?? false} />,
      scoreVerified: isStale60d ? (
        <span className="text-gray-300">Under Review</span>
      ) : (
        <span className={`text-gray-400 tabular-nums ${isStale7d ? "inline-flex items-center gap-1.5" : ""}`}>
          {isStale7d && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
          )}
          {verifiedDate}
        </span>
      ),
      compare: onToggleCompare ? (
        <label className="inline-flex cursor-pointer items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isInCompare ?? false}
            onChange={onToggleCompare}
            className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
            aria-label={`Compare ${displayName}`}
            title="Add to comparison"
          />
        </label>
      ) : null,
    };

    return (
      <>
        <tr
          className={`cursor-pointer ${rowBorder} ${rowStripe} py-0 ${rowHover}`}
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-expanded={isExpanded}
          aria-controls={`yb-row-details-${row.id}`}
          id={`yb-row-${row.id}`}
        >
          {visibleColumnIds.map((id, i) => (
            <td
              key={id}
              className={
                id === "chevron"
                  ? "w-8 min-w-0 overflow-hidden px-3 py-2.5 align-middle"
                  : id === "compare"
                    ? "w-10 min-w-0 overflow-hidden px-2 py-2.5 align-middle text-center"
                    : `min-w-0 overflow-hidden px-3 py-2.5 align-middle text-xs ${a(i)}`
              }
              onClick={id === "compare" ? (e) => e.stopPropagation() : undefined}
            >
              {btcContent[id] ?? null}
            </td>
          ))}
        </tr>

        {isExpanded && (
          <tr id={`yb-row-details-${row.id}`} aria-labelledby={`yb-row-${row.id}`}>
            <td colSpan={colSpan} className="bg-gray-50/80 px-4 py-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  {row.criteriaBreakdown &&
                    Object.entries(row.criteriaBreakdown).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <span className="w-36 shrink-0 text-xs text-gray-700">
                          {BTC_CRITERIA_LABELS[key] ?? key}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gray-700 transition-[width] duration-200"
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-gray-700">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
                {row.evidenceLinks?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {row.evidenceLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </td>
          </tr>
        )}
      </>
    );
  }

  const apyStr =
    row.apyMin != null && row.apyMax != null
      ? `${(row.apyMin * 100).toFixed(1)}% – ${(row.apyMax * 100).toFixed(1)}%`
      : "—";

  const stablecoinDisplay = (row.stablecoinTypes?.length ? row.stablecoinTypes.join(", ") : row.stablecoin) ?? "—";
  const pegDisplay = row.pegType ?? "";

  const stablecoinContent: Record<string, React.ReactNode> = {
    provider: (
      <div className="flex min-w-0 items-center gap-2">
        <span className={`shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
          <ChevronRight className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold text-gray-900" title={displayName}>{displayName}</span>
      </div>
    ),
    type: <span className="text-xs text-gray-700">{row.category ?? "—"}</span>,
    dccScore: <ScoreBadge score={row.dccScore} band={row.riskBand} />,
    apy: apyStr,
    stablecoinPeg: <>{stablecoinDisplay} {pegDisplay ? ` · ${pegDisplay}` : ""}</>,
    depeg90d: row.maxDepeg90d != null ? `${(row.maxDepeg90d * 100).toFixed(2)}%` : "—",
    withdrawal: row.withdrawalSpeed ?? "—",
    scoreVerified: verifiedDate,
    compare: onToggleCompare ? (
      <label className="inline-flex cursor-pointer items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isInCompare ?? false}
          onChange={onToggleCompare}
          className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
          aria-label={`Compare ${displayName}`}
        />
        <span className="text-[10px] text-gray-500">Compare</span>
      </label>
    ) : null,
  };

  const fiatContent: Record<string, React.ReactNode> = {
    instrument: (
      <div className="flex min-w-0 items-center gap-2">
        <span className={`shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
          <ChevronRight className="h-4 w-4" />
        </span>
        <span className="min-w-0 truncate text-sm font-semibold text-gray-900" title={displayName}>{displayName}</span>
      </div>
    ),
    stabilityScore: <ScoreBadge score={row.dccScore} band={row.riskBand} />,
    yieldRange: apyStr,
    hv30:
      row.hv30 != null ? (
        <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${hv30Color}`} title={HV30_TOOLTIP}>
          <Info className="h-3 w-3 shrink-0 text-gray-400" aria-hidden />
          {(row.hv30 * 100).toFixed(0)}%
        </span>
      ) : (
        <span className="text-xs text-gray-700">—</span>
      ),
    incomeType: row.incomeType ?? "—",
    seniority: row.seniority ?? "—",
    scoreVerified: verifiedDate,
    compare: onToggleCompare ? (
      <label className="inline-flex cursor-pointer items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isInCompare ?? false}
          onChange={onToggleCompare}
          className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
          aria-label={`Compare ${displayName}`}
        />
        <span className="text-[10px] text-gray-500">Compare</span>
      </label>
    ) : null,
  };

  const content = plannerType === "stablecoin" ? stablecoinContent : fiatContent;

  return (
    <>
      <tr
        className={`cursor-pointer ${rowBorder} ${rowStripe} ${rowHover}`}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={`yb-row-details-${row.id}`}
        id={`yb-row-${row.id}`}
      >
        {visibleColumnIds.map((id, i) => (
          <td
            key={id}
            className={
              id === "compare"
                ? "w-10 min-w-0 overflow-hidden px-2 py-2.5 align-middle text-center"
                : `min-w-0 overflow-hidden px-3 py-2.5 align-middle text-xs ${a(i)}`
            }
            onClick={id === "compare" ? (e) => e.stopPropagation() : undefined}
          >
            {id === "apy" || id === "yieldRange" ? (
              <span className="block min-w-0 truncate text-gray-700">{content[id]}</span>
            ) : (
              content[id] ?? null
            )}
          </td>
        ))}
      </tr>

      {isExpanded && plannerType !== "btc" && (
        <tr id={`yb-row-details-${row.id}`} aria-labelledby={`yb-row-${row.id}`}>
          <td colSpan={colSpan} className="bg-gray-50/80 px-4 py-3">
            <div className="grid gap-2 text-xs md:grid-cols-2">
              {plannerType === "stablecoin" && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    {row.criteriaBreakdown &&
                      Object.entries(row.criteriaBreakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-40 shrink-0 text-xs text-gray-700">
                            {STABLECOIN_CRITERIA_LABELS[key] ?? key}
                          </span>
                          <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gray-700 transition-[width] duration-200"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-gray-700">
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                  <p><strong>Type:</strong> {row.category ?? "—"}</p>
                  <p><strong>Stablecoin & Peg:</strong> {stablecoinDisplay} {pegDisplay ? ` · ${pegDisplay}` : ""}</p>
                  <p><strong>90d Max Depeg:</strong> {row.maxDepeg90d != null ? `${(row.maxDepeg90d * 100).toFixed(2)}%` : "—"}</p>
                  <p><strong>Withdrawal:</strong> {row.withdrawalSpeed ?? "—"}</p>
                  {row.notes ? <p className="md:col-span-2"><strong>Notes:</strong> {row.notes}</p> : null}
                  {row.evidenceLinks?.length ? (
                    <p className="md:col-span-2"><strong>Evidence:</strong> {row.evidenceLinks.map((e) => e.label).join(", ")}</p>
                  ) : null}
                </>
              )}
              {plannerType === "fiat" && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    {row.criteriaBreakdown &&
                      Object.entries(row.criteriaBreakdown).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-40 shrink-0 text-xs text-gray-700">
                            {FIAT_CRITERIA_LABELS[key] ?? key}
                          </span>
                          <div className="h-2 flex-1 max-w-xs overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full rounded-full bg-gray-700 transition-[width] duration-200"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-gray-700">
                            {value}
                          </span>
                        </div>
                      ))}
                  </div>
                  {row.evidenceLinks?.length ? (
                    <p className="md:col-span-2"><strong>Evidence:</strong> {row.evidenceLinks.map((e) => e.label).join(", ")}</p>
                  ) : null}
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
