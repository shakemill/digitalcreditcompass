"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  Coins,
  Banknote,
  CircleDollarSign,
  Trash2,
  X,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

type SnapshotRow = {
  id: string;
  generatedAt: string;
  clientName: string | null;
  plannerModule: string;
  dccVersion: string;
};

const MODULE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "1A": { bg: "var(--color-module-btc-bg)", text: "var(--color-module-btc)", label: "BTC" },
  "1B": { bg: "var(--color-module-fiat-bg)", text: "var(--color-module-fiat)", label: "Fiat" },
  "1C": { bg: "var(--color-module-stbl-bg)", text: "var(--color-module-stbl)", label: "Stablecoin" },
};

const PLANNER_FILTER_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "", label: "All", Icon: LayoutGrid },
  { value: "1A", label: "BTC", Icon: Coins },
  { value: "1B", label: "Fiat", Icon: Banknote },
  { value: "1C", label: "Stablecoin", Icon: CircleDollarSign },
];

function getModuleStyle(module: string) {
  return MODULE_STYLES[module] ?? { bg: "var(--color-surface-elevated)", text: "var(--color-text-secondary)", label: module };
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const [list, setList] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plannerFilter, setPlannerFilter] = useState<string>("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const highlightId = searchParams.get("id");

  const filteredList =
    !plannerFilter ? list : list.filter((row) => row.plannerModule === plannerFilter);

  const fetchList = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/suitability/snapshots", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load reports");
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList, highlightId]);

  const handleDeleteRequest = (id: string) => setDeleteConfirmId(id);
  const handleDeleteCancel = () => {
    if (!deleting) setDeleteConfirmId(null);
  };
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/suitability/snapshots/${deleteConfirmId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Delete failed");
      }
      setDeleteConfirmId(null);
      fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete report");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl">
      <header className="mb-8">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-text-primary">
          Generated reports
        </h1>
        <p className="mt-1.5 font-sans text-sm text-text-secondary">
          Risk Analysis reports. Download a PDF from any row.
        </p>
        {!loading && !error && list.length > 0 && (
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-muted">
            {list.length} report{list.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {!loading && !error && list.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Filter by planner
          </p>
          <div className="flex flex-wrap gap-2">
            {PLANNER_FILTER_OPTIONS.map((opt) => {
              const isActive = plannerFilter === opt.value;
              const count =
                opt.value === ""
                  ? list.length
                  : list.filter((r) => r.plannerModule === opt.value).length;
              const style = opt.value ? getModuleStyle(opt.value) : null;
              const Icon = opt.Icon;
              return (
                <button
                  key={opt.value || "all"}
                  type="button"
                  onClick={() => setPlannerFilter(opt.value)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider transition-colors ${
                    isActive
                      ? "border-[var(--primary)] bg-[var(--primary-dim)] text-text-primary"
                      : "border-border bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary"
                  }`}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={
                      isActive
                        ? { color: style?.text ?? "var(--primary)" }
                        : undefined
                    }
                    aria-hidden
                  />
                  <span>{opt.label}</span>
                  {count > 0 && (
                    <span className="text-[10px] opacity-80">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-4 font-sans text-sm text-red-800"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Could not load reports</p>
            <p className="mt-0.5 text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchList}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-red-700 transition-colors hover:bg-red-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <li
              key={i}
              className="animate-pulse rounded-xl border border-border bg-surface-card p-5"
              aria-hidden
            >
              <div className="flex flex-col gap-3">
                <div className="h-4 w-20 rounded bg-surface-elevated" />
                <div className="h-5 w-full rounded bg-surface-elevated" />
                <div className="h-4 w-32 rounded bg-surface-elevated" />
                <div className="mt-2 h-9 w-full rounded-lg bg-surface-elevated" />
              </div>
            </li>
          ))}
        </ul>
      ) : !error && list.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-card p-10 text-center">
          <FileText className="mx-auto h-12 w-12 text-text-muted" aria-hidden />
          <h2 className="mt-4 font-heading text-lg font-semibold text-text-primary">
            No reports yet
          </h2>
          <p className="mt-2 max-w-sm mx-auto font-sans text-sm text-text-secondary">
            Save a scenario from any planner (BTC, Fiat, or Stablecoin) — your reports will appear here.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/planner/btc"
              className="inline-flex items-center rounded-lg border border-border bg-surface-elevated px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:bg-surface-hover"
            >
              Planner BTC
            </Link>
            <Link
              href="/planner/fiat"
              className="inline-flex items-center rounded-lg border border-border bg-surface-elevated px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:bg-surface-hover"
            >
              Planner Fiat
            </Link>
            <Link
              href="/planner/stablecoin"
              className="inline-flex items-center rounded-lg border border-border bg-surface-elevated px-4 py-2 font-mono text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:bg-surface-hover"
            >
              Planner Stablecoin
            </Link>
          </div>
        </div>
      ) : !error ? (
        <>
          {filteredList.length === 0 ? (
            <p className="rounded-xl border border-border bg-surface-card p-6 font-sans text-sm text-text-muted">
              No reports match the selected planner. Try &quot;All&quot;.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map((row, index) => {
            const style = getModuleStyle(row.plannerModule);
            const isHighlighted = highlightId === row.id;
            return (
              <li
                key={row.id}
                className={`animate-fade-up relative rounded-xl border bg-surface-card p-4 transition-shadow sm:p-5 ${
                  isHighlighted
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-surface-base"
                    : "border-border hover:border-border-strong hover:shadow-md"
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(row.id)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-surface-card"
                  title="Delete report"
                  aria-label="Delete report"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
                <div className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2 pr-9">
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {row.plannerModule} · {style.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                      v{row.dccVersion}
                    </span>
                  </div>
                  <p className="font-sans text-base font-medium text-text-primary">
                    {row.clientName || "—"}
                  </p>
                  <p className="font-sans text-sm text-text-secondary">
                    {new Date(row.generatedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <a
                    href={`/api/suitability/pdf/${row.id}`}
                    download
                    className="mt-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:border-border-strong hover:bg-surface-hover hover:shadow-sm"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Download PDF
                  </a>
                </div>
              </li>
            );
          })}
            </ul>
          )}
        </>
      ) : null}

      {/* Delete confirmation modal */}
      {deleteConfirmId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={(e) => e.target === e.currentTarget && handleDeleteCancel()}
        >
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600" aria-hidden>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 id="delete-dialog-title" className="font-heading text-lg font-semibold text-text-primary">
                  Delete report?
                </h2>
                <p className="mt-0.5 font-sans text-sm text-text-secondary">
                  This report will be permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-text-primary transition-colors hover:bg-surface-hover disabled:opacity-50"
              >
                <X className="h-4 w-4" aria-hidden />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-600 px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl">
          <div className="h-8 w-48 animate-pulse rounded bg-surface-elevated" />
          <div className="mt-4 h-4 w-72 animate-pulse rounded bg-surface-elevated" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-card" />
            ))}
          </div>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
