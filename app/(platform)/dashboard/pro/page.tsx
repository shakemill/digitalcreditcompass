"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, Banknote, CircleDollarSign, Layers, FileText, BarChart3, GitCompare, Bell } from "lucide-react";

type User = { id: string; email: string; name: string; role: string };

export default function DashboardProPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/auth/login");
          return;
        }
        setUser(data.user);
        if (data.user.role !== "PRO" && data.user.role !== "SUPER_ADMIN") {
          router.replace("/dashboard");
          return;
        }
      })
      .catch(() => router.replace("/auth/login"));
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-text-secondary">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">
          PRO Dashboard — {user.name}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Full access: unlimited scenarios, full risk intelligence, Yield Board, comparison, PDF export, alerts.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/planner/btc"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm transition-colors hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#F29C22]" style={{ backgroundColor: "rgba(242, 156, 34, 0.14)" }}>
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">BTC Planner</p>
            <p className="text-xs text-text-muted">Unlimited scenarios</p>
          </div>
        </Link>
        <Link
          href="/planner/fiat"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm transition-colors hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#4F46E5]" style={{ backgroundColor: "rgba(79, 70, 229, 0.14)" }}>
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Fiat Planner</p>
            <p className="text-xs text-text-muted">Unlimited scenarios</p>
          </div>
        </Link>
        <Link
          href="/planner/stablecoin"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm transition-colors hover:bg-surface-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#0891B2]" style={{ backgroundColor: "rgba(8, 145, 178, 0.14)" }}>
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Stablecoin Planner</p>
            <p className="text-xs text-text-muted">Unlimited scenarios</p>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/yield-boards/btc"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm transition-colors hover:bg-surface-hover"
        >
          <Layers className="h-8 w-8 text-[var(--primary)]" />
          <div>
            <p className="font-medium text-text-primary">Yield Board — Full access</p>
            <p className="text-xs text-text-muted">BTC, Fiat, Stablecoin</p>
          </div>
        </Link>
        <Link
          href="/yield-boards/btc/compare"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm transition-colors hover:bg-surface-hover"
        >
          <GitCompare className="h-8 w-8 text-text-primary" />
          <div>
            <p className="font-medium text-text-primary">Strategy comparison</p>
            <p className="text-xs text-text-muted">Compare providers</p>
          </div>
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-secondary">
          <BarChart3 className="h-4 w-4" />
          Full risk intelligence
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-secondary">
          <FileText className="h-4 w-4" />
          PDF report export
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-secondary">
          <Bell className="h-4 w-4" />
          Alerts and monitoring
        </div>
      </div>
    </div>
  );
}
