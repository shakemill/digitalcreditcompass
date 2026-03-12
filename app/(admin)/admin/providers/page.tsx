"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Coins, CircleDollarSign, Banknote } from "lucide-react";

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

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCrypto, setFilterCrypto] = useState<string>("");

  useEffect(() => {
    const url = filterCrypto
      ? `/api/providers?plannerType=${encodeURIComponent(filterCrypto)}`
      : "/api/providers";
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProviders(Array.isArray(data) ? data : []);
      })
      .catch(() => setProviders([]))
      .finally(() => setLoading(false));
  }, [filterCrypto]);

  if (loading && providers.length === 0) {
    return <p className="text-text-secondary">Loading providers…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
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
                  <Link
                    href={`/admin/providers/${p.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
