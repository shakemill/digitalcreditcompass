"use client";

import { usePathname } from "next/navigation";

const MODULE_COLORS: Record<string, string> = {
  "/planner/btc": "var(--primary)",
  "/planner/fiat": "#4F46E5",
  "/planner/stablecoin": "#0891B2",
  "/yield-boards/btc": "var(--primary)",
  "/yield-boards/fiat": "#4F46E5",
  "/yield-boards/stablecoin": "#0891B2",
  "/admin": "#64748b",
};

const defaultColor = "var(--primary)";

function getModuleColor(pathname: string): string {
  if (pathname.startsWith("/admin")) return MODULE_COLORS["/admin"] ?? defaultColor;
  for (const [path, color] of Object.entries(MODULE_COLORS)) {
    if (pathname === path || pathname.startsWith(path + "/")) return color;
  }
  return defaultColor;
}

export function AccentStrip() {
  const pathname = usePathname();
  const color = getModuleColor(pathname);

  return (
    <div
      className="h-[3px] w-full shrink-0 opacity-95"
      style={{
        background: `linear-gradient(90deg, ${color} 0%, ${color}50 60%, ${color}20 85%, transparent 100%)`,
      }}
      aria-hidden
    />
  );
}
