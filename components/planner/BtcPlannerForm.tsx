"use client";

import { useBtcPlanner } from "@/hooks/useBtcPlanner";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ScenarioTable } from "./ScenarioTable";
import { SriGauge } from "@/components/ui/SriGauge";

export function BtcPlannerForm() {
  const { state, setField, result, scenarioRows, saveScenario } = useBtcPlanner();
  const scenarios = scenarioRows.map((r) => ({
    "LTV %": r.ltv,
    "BTC required": r.btcRequired.toFixed(4),
    "Liquidation price": r.liquidationPrice.toFixed(0),
    SRI: r.sri.toFixed(1),
    "Risk Band": r.riskBand,
  }));

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Total need 12m (USD)" required>
          <input
            type="number"
            value={state.totalNeed12m ?? ""}
            onChange={(e) =>
              setField("totalNeed12m", e.target.value ? Number(e.target.value) : 0)
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
        <FormField label="APR (%)">
          <input
            type="number"
            value={state.apr ?? ""}
            onChange={(e) =>
              setField("apr", e.target.value ? Number(e.target.value) : 0)
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
        <FormField label="BTC Price (USD)" required>
          <input
            type="number"
            value={state.btcPrice ?? ""}
            onChange={(e) =>
              setField("btcPrice", e.target.value ? Number(e.target.value) : 0)
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
        <FormField label="LTV (%)" required>
          <input
            type="number"
            value={state.ltv ?? ""}
            onChange={(e) =>
              setField("ltv", e.target.value ? Number(e.target.value) : 0)
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
        <FormField label="LTV liquidation (%)">
          <input
            type="number"
            placeholder="85"
            value={state.liquidationLtv ?? ""}
            onChange={(e) =>
              setField(
                "liquidationLtv",
                e.target.value ? Number(e.target.value) : 0
              )
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
      </div>
      {result != null && (
        <>
          <SriGauge
            sri={result.sri}
            riskBand={
              result.riskBand === "GREEN"
                ? "LOW"
                : result.riskBand === "AMBER"
                  ? "MEDIUM"
                  : "HIGH"
            }
          />
          <p className="text-sm text-text-secondary">
            Risk:{" "}
            <span
              className={
                result.riskBand === "GREEN"
                  ? "text-risk-low"
                  : result.riskBand === "AMBER"
                    ? "text-risk-mid"
                    : "text-risk-high"
              }
            >
              {result.riskBand}
            </span>
            {" · "}
            BTC required: {result.btcRequired.toFixed(4)} · Collateral USD:{" "}
            {result.collateralUSD.toFixed(0)}
          </p>
        </>
      )}
      <ScenarioTable scenarios={scenarios} />
      <Button onClick={saveScenario}>Save Scenario →</Button>
    </div>
  );
}
