"use client";

import type { PlannerType } from "@/types/yieldboard";

const LABELS: Record<PlannerType, string> = {
  btc: "BTC",
  stablecoin: "STABLECOIN",
  fiat: "FIAT",
};

export function AssetBadge({ type }: { type: PlannerType }) {
  const label = LABELS[type];

  if (type === "btc") {
    return (
      <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        {label}
      </span>
    );
  }

  if (type === "stablecoin") {
    return (
      <span className="inline-flex rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
      {label}
    </span>
  );
}
