"use client";

export function MaxLtvCell({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-gray-400">—</span>;
  }
  return (
    <span className="text-xs font-medium text-gray-700 tabular-nums">{value}%</span>
  );
}
