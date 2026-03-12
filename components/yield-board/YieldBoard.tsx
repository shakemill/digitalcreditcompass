"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, CircleDollarSign, Banknote, BarChart3, ArrowDownCircle, Loader2, Columns3 } from "lucide-react";
import type { PlannerType, YieldBoardRow } from "@/types/yieldboard";
import { getYieldBoardRowsFromApi } from "@/lib/yield-board/getYieldBoardRowsFromApi";
import { YieldBoardTable, getColumnOptionsForPicker } from "./YieldBoardTable";
import { DataUnderReviewBanner } from "./DataUnderReviewBanner";

const COOKIE_NAME = "dcc_yield_board_columns";
const COOKIE_MAX_AGE_DAYS = 30;

type ColumnVisibilityState = Partial<Record<PlannerType, Record<string, boolean>>>;

function getColumnVisibilityFromCookie(): ColumnVisibilityState {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const raw = match?.[1];
  if (!raw) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const result: ColumnVisibilityState = {};
    for (const type of ["btc", "stablecoin", "fiat"] as PlannerType[]) {
      const val = (parsed as Record<string, unknown>)[type];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const rec: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(val)) {
          if (typeof v === "boolean") rec[k] = v;
        }
        result[type] = rec;
      }
    }
    return result;
  } catch {
    return {};
  }
}

function setColumnVisibilityCookie(data: ColumnVisibilityState): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const TABS: { type: PlannerType; label: string; Icon: typeof Coins }[] = [
  { type: "btc", label: "BTC", Icon: Coins },
  { type: "stablecoin", label: "Stablecoin", Icon: CircleDollarSign },
  { type: "fiat", label: "Fiat", Icon: Banknote },
];

const TAB_COLORS: Record<PlannerType, string> = {
  btc: "#F29C22",
  stablecoin: "#0891B2",
  fiat: "#4F46E5",
};

export function YieldBoard({
  initialTab,
}: {
  initialTab: PlannerType;
}) {
  const pathname = usePathname();
  const currentType = pathname.includes("/yield-boards/btc")
    ? "btc"
    : pathname.includes("/yield-boards/stablecoin")
      ? "stablecoin"
      : pathname.includes("/yield-boards/fiat")
        ? "fiat"
        : initialTab;

  const [rows, setRows] = useState<YieldBoardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>(() =>
    getColumnVisibilityFromCookie()
  );
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false);

  const setColumnVisible = useCallback((type: PlannerType, columnId: string, visible: boolean) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [type]: { ...prev[type], [columnId]: visible },
    }));
  }, []);

  const visibilityForCurrent = columnVisibility[currentType] ?? {};

  useEffect(() => {
    setColumnVisibilityCookie(columnVisibility);
  }, [columnVisibility]);

  useEffect(() => {
    setLoading(true);
    getYieldBoardRowsFromApi(currentType).then((data) => {
      setRows(data);
      setLoading(false);
    });
  }, [currentType]);

  return (
    <div className="min-h-full min-w-0 bg-[#F5F2ED]">
      <div className="min-w-0 w-full p-6 lg:p-8">
        {/* Page header */}
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-gray-200/80">
              <BarChart3 className="h-5 w-5 text-gray-700" aria-hidden />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-gray-900">
                Yield Board
              </h1>
              <p className="mt-0.5 font-sans text-sm text-gray-600">
                Compare providers by DCC score. Select two or more with the Compare checkbox to see a side-by-side comparison. Click a row to expand details.
              </p>
            </div>
          </div>
        </header>

        <DataUnderReviewBanner />

        {/* Tab switcher */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {TABS.map(({ type, label, Icon }) => {
            const href = `/yield-boards/${type}`;
            const isActive = currentType === type;
            const color = TAB_COLORS[type];
            return (
              <Link
                key={type}
                href={href}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 font-mono text-sm font-medium uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-md ring-1 ring-gray-200/80"
                    : "bg-white/70 text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm"
                }`}
                style={isActive ? { borderLeft: `3px solid ${color}` } : undefined}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={isActive ? { color } : undefined}
                  aria-hidden
                />
                <span>{label}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 tabular-nums">
                  {currentType === type
                    ? loading
                      ? "…"
                      : rows.length
                    : "—"}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Sort & filters note + column picker */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-gray-500">
            <ArrowDownCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Sorted by DCC Score · {currentType}
          </p>
          <div className="relative">
            <button
              type="button"
              onClick={() => setColumnsPopoverOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              aria-expanded={columnsPopoverOpen}
              aria-haspopup="true"
            >
              <Columns3 className="h-4 w-4" />
              Columns
            </button>
            {columnsPopoverOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setColumnsPopoverOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                  <p className="px-3 py-1 text-xs font-semibold uppercase text-gray-500">
                    Show columns
                  </p>
                  {getColumnOptionsForPicker(currentType).map(({ id, label }) => (
                    <label
                      key={id}
                      className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={visibilityForCurrent[id] !== false}
                        onChange={(e) => setColumnVisible(currentType, id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-gray-700 focus:ring-gray-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white/80 py-12 ring-1 ring-gray-200/80">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" aria-hidden />
            <span className="sr-only">Loading providers…</span>
          </div>
        ) : (
          <YieldBoardTable
            rows={rows}
            plannerType={currentType}
            columnVisibility={visibilityForCurrent}
          />
        )}
      </div>
    </div>
  );
}
