import { RiskBadge, type RiskBand } from "./RiskBadge";

const RISK_BAND_COLOR: Record<RiskBand, string> = {
  LOW: "#059669",
  MEDIUM: "#D97706",
  ELEVATED: "#EA580C",
  HIGH: "#DC2626",
};

export function SriGauge({
  sri,
  riskBand,
}: {
  sri: number;
  riskBand: RiskBand;
}) {
  const pct = Math.min(100, Math.max(0, sri));
  const color = RISK_BAND_COLOR[riskBand];

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-xs uppercase text-text-muted">SRI</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium text-text-primary">
            {sri.toFixed(1)}
          </span>
          <RiskBadge band={riskBand} />
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
        <div
          className="h-full rounded-full transition-sri-bar"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
