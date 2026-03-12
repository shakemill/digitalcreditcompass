"use client";

import { RiskBadge, type RiskBand } from "@/components/ui/RiskBadge";
import { Chip } from "@/components/ui/Chip";

export function InstrumentCard({
  ticker,
  name,
  dccScore,
  apyEstimate,
  hv30,
  riskBand,
  selected,
  onToggle,
  disabled,
}: {
  ticker: string;
  name: string;
  dccScore: number;
  apyEstimate: string | number;
  hv30: number;
  riskBand: RiskBand;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const apyStr = typeof apyEstimate === "number" ? `${apyEstimate}%` : apyEstimate;
  const hv30Warning = hv30 > 35;

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        disabled
          ? "cursor-not-allowed border-border bg-surface-base opacity-60"
          : selected
            ? "border-[#4F46E5] bg-[rgba(79,70,229,0.08)]"
            : "border-border bg-surface-elevated hover:border-border-strong"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-text-primary">{ticker}</p>
          <p className="truncate text-sm text-text-muted">{name}</p>
        </div>
        <RiskBadge band={riskBand} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip variant="fiat">DCC {dccScore}</Chip>
        <span className="whitespace-nowrap"><Chip variant="muted">APY {apyStr}</Chip></span>
        <Chip variant="muted">
          HV30 {hv30}%{hv30Warning && " ⚠"}
        </Chip>
      </div>
    </button>
  );
}
