import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  sub,
  accentColor = "#F29C22",
  animationDelay = 0,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accentColor?: string;
  animationDelay?: number;
}) {
  return (
    <div
      className="rounded-lg border border-border bg-surface-card p-4 shadow-sm"
      style={{
        borderBottomWidth: 3,
        borderBottomColor: accentColor,
        animationDelay: animationDelay ? `${animationDelay}ms` : undefined,
      }}
    >
      <p className="font-mono text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className="mt-1 font-heading text-xl font-extrabold text-text-primary">
        {value}
      </p>
      {sub != null && (
        <p className="mt-1 text-sm text-text-secondary">{sub}</p>
      )}
    </div>
  );
}
