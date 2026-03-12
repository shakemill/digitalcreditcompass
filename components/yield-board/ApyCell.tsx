"use client";

export function ApyCell({
  apyMin,
  apyMax,
  custody,
}: {
  apyMin: number | null;
  apyMax: number | null;
  custody?: boolean;
}) {
  if (custody || (apyMin == null && apyMax == null)) {
    return (
      <span className="whitespace-nowrap text-xs italic text-gray-400">0% (custody)</span>
    );
  }
  const min = apyMin != null ? (apyMin * 100).toFixed(1) : "—";
  const max = apyMax != null ? (apyMax * 100).toFixed(1) : "—";
  return (
    <span className="whitespace-nowrap text-xs text-gray-700 tabular-nums">
      {min}% – {max}%
    </span>
  );
}
