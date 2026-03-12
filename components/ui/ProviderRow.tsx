import { RiskBadge, type RiskBand } from "./RiskBadge";
import { ScoreBar } from "./ScoreBar";
import { Chip } from "./Chip";

export function ProviderRow({
  rank,
  logo,
  name,
  type,
  score,
  riskBand,
  apy,
  ltv,
  rehyp,
  jurisdiction,
}: {
  rank: number;
  logo?: string | null;
  name: string;
  type: string;
  score: number;
  riskBand: RiskBand;
  apy?: string | number | null;
  ltv?: string | number | null;
  rehyp?: string | null;
  jurisdiction?: string | null;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-surface-card p-4">
      <span className="w-6 shrink-0 text-center font-mono text-sm text-text-muted">
        {rank}
      </span>
      <div
        className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10"
        style={
          logo
            ? { backgroundImage: `url(${logo})`, backgroundSize: "cover" }
            : undefined
        }
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-text-primary">{name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <Chip variant={type === "BTC" ? "btc" : type === "FIAT" ? "fiat" : "stbl"}>
            {type}
          </Chip>
          {jurisdiction != null && (
            <span className="font-mono text-xs text-text-muted">
              {jurisdiction}
            </span>
          )}
        </div>
      </div>
      <div className="w-28 shrink-0">
        <ScoreBar
          score={score}
          color={type === "BTC" ? "var(--primary)" : undefined}
        />
      </div>
      <RiskBadge band={riskBand} />
      {apy != null && (
        <span className="w-16 shrink-0 text-right font-mono text-sm font-medium text-risk-low">
          {typeof apy === "number" ? `${(apy * 100).toFixed(1)}%` : apy}
        </span>
      )}
      {ltv != null && (
        <span className="w-12 shrink-0 text-right font-mono text-xs text-text-secondary">
          {typeof ltv === "number" ? `${(ltv * 100).toFixed(0)}%` : ltv}
        </span>
      )}
      {rehyp != null && (
        <Chip variant="muted">{rehyp}</Chip>
      )}
    </div>
  );
}
