"use client";

import type { RiskBand } from "@/types/yieldboard";

const BAND_LABELS: Record<RiskBand, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  ELEVATED: "Elevated",
  HIGH: "High",
};

export function RiskBadge({ band }: { band: RiskBand }) {
  const label = BAND_LABELS[band];

  if (band === "LOW") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500 px-2.5 py-0.5 text-xs font-medium text-teal-600">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden />
        {label}
      </span>
    );
  }

  if (band === "MEDIUM") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-500">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
        {label}
      </span>
    );
  }

  if (band === "ELEVATED") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-medium text-white">
      {label}
    </span>
  );
}
