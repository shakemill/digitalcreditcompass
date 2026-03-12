"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Coins, Banknote, CircleDollarSign, Layers, BarChart3, Lock, ArrowRight, RefreshCw } from "lucide-react";

type User = { id: string; email: string; name: string; role: string };

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentPending = searchParams.get("payment") === "pending";

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.user) {
          router.replace("/auth/login");
          return;
        }
        setUser(data.user);
        if (data.user.role === "PRO") {
          router.replace("/dashboard/pro");
          return;
        }
        if (data.user.role === "SUPER_ADMIN") {
          router.replace("/dashboard/admin");
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
      {paymentPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p className="font-medium">Payment received — PRO access is being activated</p>
          <p className="mt-1 text-sm">
            This usually takes a few seconds. If your account is not updated, the webhook may not be configured for this environment. Try refreshing the page, or contact support if it persists.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/dashboard/pro")}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            <RefreshCw className="h-4 w-4" />
            Check PRO access
          </button>
        </div>
      )}
      <div>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">
          Welcome, {user.name}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Free plan: Bitcoin, USD, and Stablecoin income planners, 1 saved scenario, basic risk overview, Yield Board preview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/planner/btc" className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm hover:bg-surface-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#F29C22]" style={{ backgroundColor: "rgba(242, 156, 34, 0.14)" }}>
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">BTC Planner</p>
            <p className="text-xs text-text-muted">Income planner</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-text-muted" />
        </Link>
        <Link href="/planner/fiat" className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm hover:bg-surface-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#4F46E5]" style={{ backgroundColor: "rgba(79, 70, 229, 0.14)" }}>
            <Banknote className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Fiat Planner</p>
            <p className="text-xs text-text-muted">Income planner</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-text-muted" />
        </Link>
        <Link href="/planner/stablecoin" className="flex items-center gap-4 rounded-xl border border-border bg-surface-card p-4 shadow-sm hover:bg-surface-hover">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-[#0891B2]" style={{ backgroundColor: "rgba(8, 145, 178, 0.14)" }}>
            <CircleDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium text-text-primary">Stablecoin Planner</p>
            <p className="text-xs text-text-muted">Income planner</p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 text-text-muted" />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
        <div className="flex items-center gap-2 text-text-secondary">
          <BarChart3 className="h-5 w-5" />
          <span className="font-medium">Basic risk overview</span>
          <Lock className="h-4 w-4 text-text-muted" />
        </div>
        <p className="mt-2 text-sm text-text-muted">
          Save 1 scenario. Yield Board preview with limited filters. Upgrade to PRO for full risk intelligence and unlimited scenarios.
        </p>
        <Link href="/yield-boards/btc" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline">
          <Layers className="h-4 w-4" />
          Yield Board preview
        </Link>
      </div>

      <div className="rounded-xl border-2 border-[var(--primary)] bg-[var(--primary-dim)]/30 p-6">
        <h3 className="font-heading text-lg font-semibold text-text-primary">Upgrade to PRO</h3>
        <p className="mt-2 text-sm text-text-secondary">
          Unlimited income scenarios, full risk intelligence, full Yield Board access, strategy comparison, full instrument details, PDF report export, alerts and monitoring.
        </p>
        <Link href="/pricing" className="mt-4 inline-flex rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          View pricing
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[200px] items-center justify-center"><p className="text-text-secondary">Loading…</p></div>}>
      <DashboardContent />
    </Suspense>
  );
}
