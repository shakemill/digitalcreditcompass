"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import {
  Coins,
  Banknote,
  CircleDollarSign,
  FileText,
  LayoutList,
  Layers,
  User,
  Shield,
  Package,
  FileCheck,
  LayoutDashboard,
  ChevronDown,
  UserCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";

const MODULE_COLORS: Record<string, string> = {
  "/dashboard": "#F29C22",
  "/planner/btc": "#F29C22",
  "/planner/fiat": "#4F46E5",
  "/planner/stablecoin": "#0891B2",
  "/admin": "#64748b",
};

const defaultModuleColor = "#F29C22";

function getActiveModuleColor(pathname: string): string {
  if (pathname.startsWith("/admin")) return MODULE_COLORS["/admin"] ?? defaultModuleColor;
  for (const [path, color] of Object.entries(MODULE_COLORS)) {
    if (pathname === path || pathname.startsWith(path + "/")) return color;
  }
  return defaultModuleColor;
}

const incomePlanners: { href: string; label: string; color: string; Icon: LucideIcon }[] = [
  { href: "/planner/btc", label: "BTC", color: "#F29C22", Icon: Coins },
  { href: "/planner/fiat", label: "Fiat", color: "#4F46E5", Icon: Banknote },
  { href: "/planner/stablecoin", label: "Stablecoin", color: "#0891B2", Icon: CircleDollarSign },
];

const yieldboard: { href: string; label: string; color: string; Icon: LucideIcon }[] = [
  { href: "/yield-boards/btc", label: "BTC", color: "#F29C22", Icon: Coins },
  { href: "/yield-boards/fiat", label: "Fiat", color: "#4F46E5", Icon: Banknote },
  { href: "/yield-boards/stablecoin", label: "Stablecoin", color: "#0891B2", Icon: CircleDollarSign },
  { href: "/reports", label: "Reports", color: "#64748b", Icon: FileText },
];

const adminColor = "#64748b";
const adminNav: { href: string; label: string; Icon: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", Icon: Shield },
  { href: "/admin/providers", label: "Providers", Icon: Package },
  { href: "/admin/evidence-packs", label: "Evidence Packs", Icon: FileCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const activeColor = getActiveModuleColor(pathname);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/auth/login");
      router.refresh();
    }
  }

  return (
    <aside
      className="flex w-[260px] shrink-0 flex-col border-r border-border bg-surface-card font-sans shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06)]"
      style={{ width: 260 }}
    >
      {/* Logo */}
      <div className="flex items-center border-b border-border px-6 py-5">
        <Link
          href={pathname.startsWith("/admin") ? "/admin" : pathname.startsWith("/dashboard") ? "/dashboard" : "/planner/btc"}
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="DCC Home"
        >
          <Image
            src="/logo-dcc.png"
            alt="DCC"
            width={180}
            height={65}
            className="h-14 w-auto max-w-[200px] shrink-0 object-contain object-left"
            priority
            unoptimized
          />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-5">
        <Link
          href="/dashboard"
          className={`relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
            pathname === "/dashboard" || pathname.startsWith("/dashboard/")
              ? "pl-4 pr-3"
              : "px-3 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          }`}
          style={
            pathname === "/dashboard" || pathname.startsWith("/dashboard/")
              ? { backgroundColor: `${defaultModuleColor}14`, color: defaultModuleColor }
              : undefined
          }
        >
          {(pathname === "/dashboard" || pathname.startsWith("/dashboard/")) && (
            <span
              className="absolute left-1.5 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
              style={{ backgroundColor: defaultModuleColor }}
              aria-hidden
            />
          )}
          <LayoutDashboard className="h-4 w-4 shrink-0" />
          Dashboard
        </Link>

        <p className="mb-2.5 mt-4 flex items-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          <LayoutList className="h-3.5 w-3.5 shrink-0 opacity-70" />
          Income Planners
        </p>
        {incomePlanners.map((item) => {
          const isActive = pathname === item.href;
          const ItemIcon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                isActive ? "pl-4 pr-3" : "px-3 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${item.color}14`,
                      color: item.color,
                    }
                  : undefined
              }
            >
              {isActive && (
                <span
                  className="absolute left-1.5 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
              )}
              <ItemIcon className="h-4 w-4 shrink-0" style={isActive ? { color: item.color } : undefined} />
              {item.label}
            </Link>
          );
        })}

        <p className="mb-2.5 mt-6 flex items-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" />
          Yieldboard
        </p>
        {yieldboard.map((item) => {
          const isActive = pathname === item.href;
          const ItemIcon = item.Icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                isActive ? "pl-4 pr-3" : "px-3 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: `${item.color}14`,
                      color: item.color,
                    }
                  : undefined
              }
            >
              {isActive && (
                <span
                  className="absolute left-1.5 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
              )}
              <ItemIcon className="h-4 w-4 shrink-0" style={isActive ? { color: item.color } : undefined} />
              {item.label}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <>
            <p className="mb-2.5 mt-6 flex items-center gap-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              <Shield className="h-3.5 w-3.5 shrink-0 opacity-70" />
              Admin
            </p>
            {adminNav.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const ItemIcon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-200 ${
                    isActive ? "pl-4 pr-3" : "px-3 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${adminColor}14`,
                          color: adminColor,
                        }
                      : undefined
                  }
                >
                  {isActive && (
                    <span
                      className="absolute left-1.5 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: adminColor }}
                      aria-hidden
                    />
                  )}
                  <ItemIcon className="h-4 w-4 shrink-0" style={isActive ? { color: adminColor } : undefined} />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User dropdown */}
      <div className="relative border-t border-border p-4" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-surface-elevated/80 px-3 py-2.5 shadow-sm transition-colors hover:bg-surface-hover"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--primary)]"
            style={{ backgroundColor: "var(--primary-dim)" }}
            aria-hidden
          >
            <User className="h-4 w-4" />
          </div>
          <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-text-primary">
            {user?.name?.trim() || user?.email || "User"}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        {dropdownOpen && (
          <div className="absolute bottom-16 left-4 right-4 z-50 flex flex-col gap-0.5 rounded-xl border border-border bg-surface-card py-1 shadow-lg">
            <Link
              href="/dashboard/profile"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <UserCircle className="h-4 w-4 shrink-0" />
              Modifier le profil
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
