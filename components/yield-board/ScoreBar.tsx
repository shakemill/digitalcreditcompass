"use client";

import type { RiskBand } from "@/types/yieldboard";

const BAND_COLORS: Record<RiskBand, string> = {
  LOW: "#0d9488",
  MEDIUM: "#ea580c",
  ELEVATED: "#dc2626",
  HIGH: "#b91c1c",
};

export function ScoreBar({
  score,
  band,
}: {
  score: number;
  band: RiskBand;
}) {
  const fillColor = BAND_COLORS[band];
  const pct = Math.min(100, Math.max(0, score));

  return (
    <div
      className="h-2 w-[120px] overflow-hidden rounded-full bg-gray-200"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${pct}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}
