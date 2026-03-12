export function PegMonitor({ pegDeviation }: { pegDeviation?: number | null }) {
  if (pegDeviation == null) return null;

  const pct = pegDeviation * 100;
  const status = Math.abs(pct) <= 1 ? "ok" : Math.abs(pct) <= 3 ? "warning" : "alert";

  return (
    <div className="rounded-lg border border-border bg-surface-card p-4">
      <p className="text-sm text-text-secondary">Déviation peg 90j</p>
      <p className={`font-mono text-lg font-semibold ${
        status === "ok" ? "text-risk-low" : status === "warning" ? "text-risk-mid" : "text-risk-high"
      }`}>
        {pct >= 0 ? "+" : ""}{pct.toFixed(2)}%
      </p>
    </div>
  );
}
