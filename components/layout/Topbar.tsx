"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/layout/SidebarProvider";
import { Bell, Settings, Activity, ChevronRight, Menu, ChevronDown, LogOut, UserPen, Home, LayoutDashboard } from "lucide-react";

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
  if (pathname === "/planner/btc") {
    return [{ label: "Income Planners", href: "/planner/btc" }, { label: "BTC" }];
  }
  if (pathname === "/planner/fiat") {
    return [{ label: "Income Planners", href: "/planner/btc" }, { label: "Fiat" }];
  }
  if (pathname === "/planner/stablecoin") {
    return [{ label: "Income Planners", href: "/planner/btc" }, { label: "Stablecoin" }];
  }
  if (pathname === "/yield-boards/btc") {
    return [{ label: "Yield Board", href: "/yield-boards/btc" }, { label: "BTC" }];
  }
  if (pathname === "/yield-boards/fiat") {
    return [{ label: "Yield Board", href: "/yield-boards/btc" }, { label: "Fiat" }];
  }
  if (pathname === "/yield-boards/stablecoin") {
    return [{ label: "Yield Board", href: "/yield-boards/btc" }, { label: "Stablecoin" }];
  }
  if (pathname.startsWith("/yield-boards/")) {
    return [{ label: "Yield Board", href: "/yield-boards/btc" }, { label: PAGE_TITLES[pathname] ?? "Yield Board" }];
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
  const router = useRouter();
  const sidebarCtx = useSidebar();
  const isDesktop = sidebarCtx?.isDesktop ?? true;
  const setSidebarOpen = sidebarCtx?.setSidebarOpen ?? (() => {});
  const breadcrumb = getBreadcrumb(pathname);

  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const [adminDisplayName, setAdminDisplayName] = useState<string | null>(null);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdminPage) return;
    let cancelled = false;
    (async () => {
      const [authRes, adminRes] = await Promise.all([
        fetch("/api/auth/session"),
        fetch("/api/admin/session"),
      ]);
      if (cancelled) return;
      const adminData = await adminRes.json();
      if (!adminData?.ok) {
        setAdminDisplayName(null);
        return;
      }
      try {
        const authData = await authRes.json();
        const name = authData?.user?.name?.trim() || authData?.user?.email;
        setAdminDisplayName(name || "Admin");
      } catch {
        setAdminDisplayName("Admin");
      }
    })();
    return () => { cancelled = true; };
  }, [isAdminPage]);

  useEffect(() => {
    if (isAdminPage) return;
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.user) return;
        const name = data.user.name?.trim() || data.user.email || "User";
        setUserDisplayName(name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isAdminPage]);

  useEffect(() => {
    if (!isAdminPage) return;
    function handleClickOutside(e: MouseEvent) {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target as Node)) {
        setAdminDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAdminPage]);

  useEffect(() => {
    if (isAdminPage) return;
    function handleClickOutside(e: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAdminPage]);

  async function handleAdminLogout() {
    setAdminDropdownOpen(false);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleUserLogout() {
    setUserDropdownOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-card px-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] sm:gap-4 sm:px-5 lg:h-[72px] lg:gap-6 lg:px-6">
      {!isDesktop && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
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
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden items-center gap-2 rounded-full border border-border bg-surface-elevated/80 px-3 py-1.5 text-xs font-medium text-text-secondary shadow-sm sm:inline-flex md:inline-flex">
          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" aria-hidden />
          <span>Engine Live</span>
        </span>
        <span className="hidden rounded-lg border border-border bg-surface-elevated/80 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-muted shadow-sm md:inline">
          v1.0
        </span>
        <div className="flex items-center gap-0.5 border-l border-border pl-2 sm:pl-3">
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
          {isAdminPage && adminDisplayName && (
            <div className="relative" ref={adminDropdownRef}>
              <button
                type="button"
                onClick={() => setAdminDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated/80 px-2.5 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-hover"
                aria-label="Account menu"
                aria-expanded={adminDropdownOpen}
                aria-haspopup="true"
              >
                <span className="max-w-[120px] truncate sm:max-w-[160px]">{adminDisplayName}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${adminDropdownOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {adminDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-surface-card py-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">
                    {adminDisplayName}
                  </div>
                  <Link
                    href="/"
                    onClick={() => setAdminDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setAdminDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    Go to my dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setAdminDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <UserPen className="h-4 w-4 shrink-0" />
                    Edit profile
                  </Link>
                  <div className="my-1 border-t border-border" role="separator" />
                  <button
                    type="button"
                    onClick={handleAdminLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
          {!isAdminPage && userDisplayName && (
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated/80 px-2.5 py-1.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-surface-hover"
                aria-label="Account menu"
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <span className="max-w-[120px] truncate sm:max-w-[160px]">{userDisplayName}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${userDropdownOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-surface-card py-1 shadow-lg">
                  <div className="border-b border-border px-3 py-2 text-xs font-medium text-text-muted">
                    {userDisplayName}
                  </div>
                  <Link
                    href="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Home className="h-4 w-4 shrink-0" />
                    Home
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    Go to my dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <UserPen className="h-4 w-4 shrink-0" />
                    Edit profile
                  </Link>
                  <div className="my-1 border-t border-border" role="separator" />
                  <button
                    type="button"
                    onClick={handleUserLogout}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
