"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useSidebar } from "@/components/layout/SidebarProvider";
import {
  Coins,
  Banknote,
  CircleDollarSign,
  FileText,
  LayoutList,
  Layers,
  Shield,
  Package,
  FileCheck,
  LayoutDashboard,
  X,
  Users,
  Search,
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
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/seo", label: "SEO", Icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useSession();
  const sidebarCtx = useSidebar();
  const isDesktop = sidebarCtx?.isDesktop ?? true;
  const sidebarOpen = sidebarCtx?.sidebarOpen ?? false;
  const setSidebarOpen = sidebarCtx?.setSidebarOpen ?? (() => {});
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const closeDrawer = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="Go to landing page"
          onClick={closeDrawer}
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
        {!isDesktop && (
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-5">
        <Link
          href="/dashboard"
          onClick={closeDrawer}
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
              onClick={closeDrawer}
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
              onClick={closeDrawer}
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
                  onClick={closeDrawer}
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
    </>
  );

  if (isDesktop) {
    return (
      <aside
        className="flex w-[260px] shrink-0 flex-col border-r border-border bg-surface-card font-sans shadow-[2px_0_12px_-4px_rgba(0,0,0,0.06)]"
        style={{ width: 260 }}
      >
        {sidebarContent}
      </aside>
    );
  }

  return (
    <div
      className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border bg-surface-card font-sans shadow-xl transition-transform duration-200 ease-out"
      style={{
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
      }}
    >
      {sidebarContent}
    </div>
  );
}
