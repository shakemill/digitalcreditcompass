export function BreakdownBar({
  label,
  value,
  color = "#F29C22",
  displayValue,
}: {
  label: string;
  value: number;
  color?: string;
  displayValue: string;
}) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className="flex w-full items-center gap-3">
      <span
        className="min-w-[6rem] shrink-0 font-mono text-xs text-text-secondary"
      >
        {label}
      </span>
      <div className="min-w-0 flex-1 overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-xs text-text-primary">
        {displayValue}
      </span>
    </div>
  );
}
