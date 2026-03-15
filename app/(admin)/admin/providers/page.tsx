"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Coins, CircleDollarSign, Banknote, Search, ChevronLeft, ChevronRight } from "lucide-react";

type Provider = {
  id: string;
  name: string;
  slug: string;
  plannerType: string;
  isActive: boolean;
  latestScore?: number | null;
};

const PLANNER_TYPES = [
  { value: "", label: "All", Icon: null },
  { value: "BTC", label: "BTC", Icon: Coins },
  { value: "FIAT", label: "Fiat", Icon: Banknote },
  { value: "STABLECOIN", label: "Stablecoin", Icon: CircleDollarSign },
] as const;

const PAGE_SIZE = 10;

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCrypto, setFilterCrypto] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [filterCrypto, search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCrypto) params.set("plannerType", filterCrypto);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    const url = `/api/providers?${params.toString()}`;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data?.providers) {
          setProviders(data.providers);
          setTotal(data.total ?? 0);
          setTotalPages(data.totalPages ?? 0);
        } else {
          const list = Array.isArray(data) ? data : [];
          setProviders(list);
          setTotal(list.length);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setProviders([]);
        setTotal(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [filterCrypto, search, page]);

  const goPrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const goNext = useCallback(() => setPage((p) => Math.min(totalPages, p + 1)), [totalPages]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDelete = useCallback(async (p: Provider) => {
    if (!confirm(`Delete provider "${p.name}" (${p.slug})? This will remove all score snapshots, scoring inputs, and evidence packs for this provider.`)) return;
    setDeletingId(p.id);
    try {
      const res = await fetch(`/api/providers/${p.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d?.error ?? "Failed to delete provider");
        return;
      }
      setProviders((prev) => prev.filter((x) => x.id !== p.id));
      setTotal((t) => Math.max(0, t - 1));
    } finally {
      setDeletingId(null);
    }
  }, []);

  if (loading && providers.length === 0) {
    return <p className="text-text-secondary">Loading providers…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search by name or slug…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56 rounded-lg border border-border bg-surface-card py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-muted">Filter by:</span>
          <div className="flex rounded-lg border border-border bg-surface-card p-0.5">
            {PLANNER_TYPES.map(({ value, label, Icon }) => (
              <button
                key={value || "all"}
                type="button"
                onClick={() => setFilterCrypto(value)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterCrypto === value
                    ? "bg-text-primary text-surface-card"
                    : "text-text-secondary hover:bg-border hover:text-text-primary"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </button>
            ))}
          </div>
        </div>
        </div>
        <Link
          href="/admin/providers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface-card hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add provider
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-muted">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-muted">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-muted">
                Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-text-muted">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-text-muted">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {providers.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-text-primary">{p.name}</td>
                <td className="px-4 py-3 text-text-secondary">{p.plannerType}</td>
                <td className="px-4 py-3 text-text-secondary">
                  {p.latestScore != null ? p.latestScore : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      p.isActive
                        ? "text-risk-low"
                        : "text-text-muted"
                    }
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/providers/${p.id}/edit`}
                      className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      disabled={deletingId !== null}
                      className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-risk-high disabled:opacity-50"
                      title="Delete provider"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-medium text-text-secondary hover:bg-border disabled:opacity-50 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-medium text-text-secondary hover:bg-border disabled:opacity-50 disabled:pointer-events-none"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
