"use client";

import type { RiskBand } from "@/types/yieldboard";

const BAND_STYLES: Record<
  RiskBand,
  { border: string; bg: string; dot: string; text: string }
> = {
  LOW: {
    border: "border-green-400",
    bg: "bg-green-50",
    dot: "bg-green-500",
    text: "text-green-700",
  },
  MEDIUM: {
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    dot: "bg-yellow-400",
    text: "text-yellow-700",
  },
  ELEVATED: {
    border: "border-orange-400",
    bg: "bg-orange-50",
    dot: "bg-orange-400",
    text: "text-orange-700",
  },
  HIGH: {
    border: "border-red-400",
    bg: "bg-red-50",
    dot: "bg-red-500",
    text: "text-red-700",
  },
};

export function ScoreBadge({
  score,
  band,
}: {
  score: number;
  band: RiskBand;
}) {
  const s = BAND_STYLES[band];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${s.border} ${s.bg}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} aria-hidden />
      <span className={`text-xs font-bold tabular-nums ${s.text}`}>{score}</span>
    </span>
  );
}
