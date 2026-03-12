function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-risk-low)";
  if (score >= 60) return "var(--color-risk-mid)";
  if (score >= 40) return "var(--color-risk-elev)";
  return "var(--color-risk-high)";
}

export function ScoreBar({
  score,
  color,
}: {
  score: number;
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, score));
  const fillColor = color ?? getScoreColor(score);

  return (
    <div className="flex w-full items-center gap-2">
      <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-text-primary">
        {Math.round(score)}
      </span>
      <div className="min-w-0 flex-1 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-2 rounded-full transition-score-bar"
          style={{
            width: `${pct}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}
