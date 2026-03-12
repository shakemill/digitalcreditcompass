"use client";

export function LiquidationLtvCell({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="font-bold text-red-400">—</span>;
  }
  return (
    <span className="text-xs font-bold text-red-600 tabular-nums">{value}%</span>
  );
}
