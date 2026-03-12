import { ReactNode } from "react";

export function ResultCell({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:border-border-strong">
      <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        className="mt-0.5 font-heading text-base font-bold text-text-primary"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </p>
      {sub != null && (
        <p className="mt-1 text-xs text-text-secondary">{sub}</p>
      )}
    </div>
  );
}
