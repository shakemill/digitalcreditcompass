"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, Activity, ChevronRight } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/pro": "Dashboard — PRO",
  "/dashboard/admin": "Dashboard — Admin",
  "/dashboard/profile": "Profile",
  "/pricing": "Pricing",
  "/planner/btc": "Planner — BTC",
  "/planner/fiat": "Planner — Fiat",
  "/planner/stablecoin": "Planner — Stablecoin",
  "/yield-boards/btc": "Yield Board — BTC",
  "/yield-boards/fiat": "Yield Board — Fiat",
  "/yield-boards/stablecoin": "Yield Board — Stablecoin",
  "/reports": "Reports",
  "/admin": "Admin",
  "/admin/login": "Admin — Login",
  "/admin/providers": "Providers",
  "/admin/evidence-packs": "Evidence Packs",
};

function getBreadcrumb(pathname: string): { label: string; href?: string }[] {
  if (pathname.startsWith("/admin")) {
    const base = [{ label: "Admin", href: "/admin" }];
    if (pathname === "/admin" || pathname === "/admin/login") {
      return pathname === "/admin/login" ? [...base, { label: "Login" }] : base;
    }
    if (pathname === "/admin/providers") return [...base, { label: "Providers" }];
    if (pathname.startsWith("/admin/providers/new")) return [...base, { label: "Providers" }, { label: "New" }];
    if (pathname.match(/^\/admin\/providers\/[^/]+\/edit$/)) return [...base, { label: "Providers" }, { label: "Edit" }];
    if (pathname === "/admin/evidence-packs") return [...base, { label: "Evidence Packs" }];
    if (pathname.match(/^\/admin\/evidence-packs\/[^/]+$/)) return [...base, { label: "Evidence Packs" }, { label: "Detail" }];
    return base;
  }
  if (pathname === "/planner/btc" || pathname === "/planner/fiat" || pathname === "/planner/stablecoin") {
    return [{ label: "Income Planners", href: "/planner/btc" }];
  }
  if (pathname.startsWith("/yield-boards/")) {
    return [
      { label: "Platform", href: "/yield-boards/btc" },
      { label: PAGE_TITLES[pathname] ?? "Yield Board" },
    ];
  }
  if (pathname === "/reports") {
    return [{ label: "Platform" }, { label: "Reports" }];
  }
  if (pathname === "/dashboard" || pathname === "/dashboard/pro" || pathname === "/dashboard/admin") {
    return [{ label: "Dashboard", href: "/dashboard" }];
  }
  if (pathname === "/dashboard/profile") {
    return [{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }];
  }
  if (pathname === "/pricing") {
    return [{ label: "Pricing", href: "/pricing" }];
  }
  return [{ label: "DCC" }];
}

export function Topbar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? (pathname.startsWith("/admin") ? "Admin" : "DCC Platform");
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="flex h-[72px] shrink-0 items-center justify-between gap-6 border-b border-border bg-surface-card px-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <nav className="flex items-center gap-1 text-xs text-text-muted" aria-label="Breadcrumb">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-border-strong" aria-hidden />
              )}
              {item.href != null ? (
                <Link
                  href={item.href}
                  className="rounded px-1 py-0.5 font-medium transition-colors hover:text-text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="rounded px-1 py-0.5 font-semibold text-text-primary">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
        <h1 className="truncate font-heading text-xl font-semibold tracking-tight text-text-primary">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/80 px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm">
          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          <span>Engine Live</span>
        </span>
        <span className="rounded-lg border border-border bg-surface-elevated/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-muted shadow-sm">
          v1.0
        </span>
        <div className="flex items-center gap-0.5 border-l border-border pl-3">
          <button
            type="button"
            className="rounded-lg p-2.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-lg p-2.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
