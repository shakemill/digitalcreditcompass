"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBtcPlanner } from "@/hooks/useBtcPlanner";
import { ClientInfoModal } from "@/components/planner/ClientInfoModal";
import { usePlannerContext } from "@/context/PlannerContext";
import type { ClientInfo, BtcScenarioSnapshot } from "@/context/PlannerContext";
import { useSession } from "@/hooks/useSession";
import { StatCard } from "@/components/ui/StatCard";
import { FormField } from "@/components/ui/FormField";
import { ResultCell } from "@/components/ui/ResultCell";
import { SriGauge } from "@/components/ui/SriGauge";
import { Button } from "@/components/ui/Button";
import type { RiskBand } from "@/components/ui/RiskBadge";
import { WEIGHTS } from "@/lib/scoring/weights";
import { BreakdownBar } from "@/components/ui/BreakdownBar";
import { AlertCircle, X } from "lucide-react";

const RISK_COLOR: Record<string, string> = {
  GREEN: "#059669",
  AMBER: "#D97706",
  RED:   "#DC2626",
};

const BTC_CRITERIA_LABELS: Record<string, string> = {
  transparency: "Transparency",
  collateralControl: "Collateral Control",
  jurisdiction: "Jurisdiction",
  structuralRisk: "Structural Risk",
  trackRecord: "Track Record",
};

const DURATION_ROWS = [
  { label: "< 3 months",   min: 0,  max: 2,   mult: 1.00 },
  { label: "3–5 months",   min: 3,  max: 5,   mult: 0.97 },
  { label: "6–11 months",  min: 6,  max: 11,  mult: 0.93 },
  { label: "12–23 months", min: 12, max: 23,  mult: 0.87 },
  { label: "≥ 24 months",  min: 24, max: 999, mult: 0.80 },
];

export default function BtcPlannerPage() {
  const router = useRouter();
  const {
    state,
    setField,
    result,
    resultMin,
    resultMax,
    hasInterestRange,
    scenarioRows,
    multiplier,
    adjustedProviders,
    selectedProviderName,
    setSelectedProvider,
    selectedProvider,
  } = useBtcPlanner();
  const { saveSnapshot, setClientInfo, clientInfo } = usePlannerContext();
  const { user } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSaveClick = () => {
    setShowModal(true);
  };

  const handleModalConfirm = async (info: ClientInfo) => {
    setGenerating(true);
    setClientInfo(info);
    if (result) {
      const snapshot: BtcScenarioSnapshot = {
        module: "1A",
        inputs: {
          totalNeed12m: state.totalNeed12m,
          btcPrice: state.btcPrice,
          apr: state.apr,
          ltv: state.ltv,
          durationMonths: state.durationMonths,
          liquidationLtv: state.liquidationLtv,
        },
        results: {
          btcRequired: result.btcRequired,
          monthlyTarget: result.monthlyTarget,
          marginCallPrice: result.marginCallPrice,
          liquidationPrice: result.liquidationPrice,
          totalInterest: result.totalInterest,
          totalCost: result.totalCost,
          sri: result.sri,
          riskBand: result.riskBand,
          collateralUSD: result.collateralUSD,
        },
        yieldBoard: adjustedProviders.map((p) => ({
          name: p.name,
          score: p.score,
          adjustedScore: p.adjustedScore,
          apy: p.apy,
          multiplier: p.multiplier,
        })),
        ...(selectedProviderName && selectedProvider
          ? {
              selectedProviderName,
              selectedProviderApy: selectedProvider.apy,
              ...(selectedProvider.apyMinPercent != null && selectedProvider.apyMaxPercent != null
                ? {
                    selectedProviderApyMin: selectedProvider.apyMinPercent,
                    selectedProviderApyMax: selectedProvider.apyMaxPercent,
                  }
                : {}),
              ...(selectedProvider.criteriaBreakdown
                ? { selectedProviderCriteria: selectedProvider.criteriaBreakdown }
                : {}),
            }
          : {}),
        savedAt: new Date().toISOString(),
      };
      saveSnapshot(snapshot);
      try {
        const res = await fetch("/api/suitability/create-from-planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plannerModule: "1A",
            clientName: info.clientName,
            riskPreference: info.riskPreference,
            snapshot,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.id) {
          setSaveError(null);
          router.push(`/reports?id=${data.id}`);
        } else {
          if (data?.error === "FREE_PLAN_REPORT_LIMIT") {
            setSaveError(data?.message ?? "Free plan allows only one saved report. Delete your existing report or upgrade to PRO.");
          } else {
            console.error("[BTC planner] Save report failed:", res.status, data);
          }
        }
      } catch (e) {
        console.error("[BTC planner] Save report error:", e);
      }
    }
    setGenerating(false);
    setShowModal(false);
  };

  const sriBand: RiskBand =
    result?.riskBand === "GREEN" ? "LOW" :
    result?.riskBand === "AMBER" ? "MEDIUM" : "HIGH";

  return (
    <div className="min-h-full w-full max-w-[1600px] space-y-5">

      {saveError && (
        <div
          className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 p-4 font-sans text-sm text-amber-900"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium">Cannot save report</p>
            <p className="mt-0.5 text-amber-800">{saveError}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                href="/reports"
                className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-amber-800 transition-colors hover:bg-amber-50"
              >
                View reports
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center rounded-lg border border-amber-400 bg-amber-500 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-amber-600"
              >
                Upgrade to PRO
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="rounded-lg p-1.5 text-amber-700 transition-colors hover:bg-amber-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="space-y-2">
        {selectedProvider && (
          <p className="font-mono text-[11px] text-text-muted">
            Total with <span className="font-semibold text-text-primary">{selectedProvider.name}</span>
            {selectedProvider.apy !== "—"
              ? ` — APY ${selectedProvider.apy}`
              : " — Custody (0% yield)"}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="BTC Required"
            value={result ? result.btcRequired.toFixed(4) : "—"}
            sub={result ? `≈ $${Math.round(result.collateralUSD).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD` : "Enter inputs"}
            accentColor="#F29C22"
          />
          <StatCard
            label="Monthly Target"
            value={
              hasInterestRange && resultMin && resultMax
                ? `$${Math.round(resultMin.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${Math.round(resultMax.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                : result
                  ? `$${Math.round(result.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                  : "—"
            }
            sub="Principal + interest / 12"
            accentColor="#059669"
          />
          <StatCard
            label="Scenario Risk Index"
            value={result ? result.sri.toFixed(1) : "—"}
            sub={result ? `${result.riskBand} band · LTV ${state.ltv}%` : "—"}
            accentColor={result ? RISK_COLOR[result.riskBand] : "#9C9488"}
          />
        </div>
      </div>

      {/* ── GRILLE 2 COLONNES ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2.1fr_1fr]">

        {/* COLONNE GAUCHE */}
        <div className="space-y-5">

          {/* CARD FORMULAIRE */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <div className="font-display font-semibold text-[13px] text-text-primary">
                  ₿ BTC Income Planner
                </div>
                <div className="font-mono text-[9px] text-text-muted mt-0.5 tracking-wide">
                  BTC-collateralised lending · Deterministic model
                </div>
              </div>
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded border"
                style={{ background: "rgba(242,156,34,0.09)", color: "#F29C22", borderColor: "rgba(242,156,34,0.25)" }}>
                BTC
              </span>
            </div>

            <div className="p-5 space-y-4">

              {/* SECTION INPUTS */}
              <div className="font-mono text-[8.5px] uppercase tracking-[2px] font-bold text-text-secondary
                flex items-center gap-2 after:flex-1 after:h-px after:bg-border after:content-['']">
                Inputs
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField label="Total Need 12m (USD)">
                  <input
                    type="number"
                    min={0}
                    value={state.totalNeed12m}
                    onChange={e => setField("totalNeed12m", Number(e.target.value) || 0)}
                    className="w-full bg-surface-base border-[1.5px] border-border rounded-lg
                      px-3 py-2 font-mono text-[12.5px] text-text-primary outline-none
                      focus:border-border-strong transition-colors"
                  />
                </FormField>
                <FormField label="BTC Price (USD)">
                  <input
                    type="number"
                    min={0}
                    value={state.btcPrice}
                    onChange={e => setField("btcPrice", Number(e.target.value) || 0)}
                    className="w-full bg-surface-base border-[1.5px] border-border rounded-lg
                      px-3 py-2 font-mono text-[12.5px] text-text-primary outline-none
                      focus:border-border-strong transition-colors"
                  />
                </FormField>
                <FormField label="APR (%)">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={state.apr === 0 ? "" : Number(state.apr).toFixed(2)}
                    onChange={e => setField("apr", e.target.value === "" ? 0 : Number(e.target.value) || 0)}
                    className="w-full bg-surface-base border-[1.5px] border-border rounded-lg
                      px-3 py-2 font-mono text-[12.5px] text-text-primary outline-none
                      focus:border-border-strong transition-colors"
                  />
                </FormField>
                <FormField label="Duration (months)">
                  <select
                    value={state.durationMonths}
                    onChange={e => setField("durationMonths", Number(e.target.value))}
                    className="w-full bg-surface-base border-[1.5px] border-border rounded-lg
                      px-3 py-2 font-mono text-[12.5px] text-text-primary outline-none
                      focus:border-border-strong transition-colors"
                  >
                    {[1, 3, 6, 12, 24, 36].map(m => (
                      <option key={m} value={m}>{m} month{m > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* SLIDER LTV — green when risk low (GREEN), amber/red otherwise */}
              <FormField label={`LTV — Loan-to-Value`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={1}
                    value={state.ltv}
                    onChange={e => setField("ltv", Number(e.target.value))}
                    className="flex-1 h-1 cursor-pointer"
                    style={{
                      accentColor: result ? RISK_COLOR[result.riskBand] : "#F29C22",
                    }}
                  />
                  <span
                    className="font-mono text-[12.5px] font-semibold min-w-[44px] text-right"
                    style={{
                      color: result ? RISK_COLOR[result.riskBand] : "#F29C22",
                    }}
                  >
                    {state.ltv}%
                  </span>
                </div>
              </FormField>

              {/* SECTION RESULTS */}
              <div className="font-mono text-[8.5px] uppercase tracking-[2px] font-bold text-text-secondary
                flex items-center gap-2 after:flex-1 after:h-px after:bg-border after:content-['']">
                Computed Results
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ResultCell
                  label="BTC Required"
                  value={result ? result.btcRequired.toFixed(4) : "—"}
                  sub="at current LTV"
                  valueColor="#F29C22"
                />
                <ResultCell
                  label="Monthly Target"
                  value={
                    hasInterestRange && resultMin && resultMax
                      ? `$${Math.round(resultMin.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${Math.round(resultMax.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : result
                        ? `$${Math.round(result.monthlyTarget).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : "—"
                  }
                  sub="Principal + interest"
                />
                <ResultCell
                  label="Margin Call Price"
                  value={result ? `$${Math.round(result.marginCallPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
                  sub="Trigger @ 75% LTV"
                  valueColor="#D97706"
                />
                <ResultCell
                  label="Liquidation Price"
                  value={result ? `$${Math.round(result.liquidationPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"}
                  sub="Trigger @ 85% LTV"
                  valueColor="#EA580C"
                />
                <ResultCell
                  label={`Total Interest (${state.durationMonths}m)`}
                  value={
                    hasInterestRange && resultMin && resultMax
                      ? `$${Math.round(resultMin.totalInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${Math.round(resultMax.totalInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : result
                        ? `$${Math.round(result.totalInterest).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : "—"
                  }
                  sub={
                    selectedProvider
                      ? `APY ${selectedProvider.name} ${selectedProvider.apy} × ${state.durationMonths}m`
                      : `APR ${Number(state.apr).toFixed(2)}% × ${state.durationMonths}m`
                  }
                  valueColor="#7C3AED"
                />
                <ResultCell
                  label={`Total Cost (${state.durationMonths}m)`}
                  value={
                    hasInterestRange && resultMin && resultMax
                      ? `$${Math.round(resultMin.totalCost).toLocaleString("en-US", { maximumFractionDigits: 0 })} – $${Math.round(resultMax.totalCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      : result
                        ? `$${Math.round(result.totalCost).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        : "—"
                  }
                  sub="Principal + total interest"
                />
              </div>

              {/* SRI GAUGE */}
              {result && (
                <SriGauge sri={result.sri} riskBand={sriBand} />
              )}

              {/* SECTION SCENARIO TABLE */}
              <div className="font-mono text-[8.5px] uppercase tracking-[2px] font-bold text-text-secondary
                flex items-center gap-2 after:flex-1 after:h-px after:bg-border after:content-['']">
                Scenario Comparison
              </div>

              <div className="min-w-0 overflow-x-auto">
              {/* Headers */}
              <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: "1.2fr repeat(4, 1fr)" }}>
                <div />
                {[10, 25, 50, 75].map(pct => (
                  <div key={pct} className="text-center py-2 rounded-lg border-[1.5px] font-mono text-[8px] font-medium"
                    style={{
                      background: pct <= 25 ? "rgba(5,150,105,0.06)"  : pct === 50 ? "rgba(217,119,6,0.06)"  : "rgba(234,88,12,0.06)",
                      borderColor: pct <= 25 ? "rgba(5,150,105,0.2)"  : pct === 50 ? "rgba(217,119,6,0.2)"  : "rgba(234,88,12,0.2)",
                      color:       pct <= 25 ? "#059669" : pct === 50 ? "#D97706" : "#EA580C",
                    }}>
                    {pct}% LTV
                  </div>
                ))}
              </div>

              {/* BTC Required row */}
              <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: "1.2fr repeat(4, 1fr)" }}>
                <div className="flex items-center font-mono text-[8.5px] text-text-muted">BTC Required</div>
                {scenarioRows.map(sc => (
                  <div key={sc.ltv} className="text-center py-2 bg-surface-base border-[1.5px] border-border rounded-lg">
                    <span className="font-mono text-[11px] font-semibold text-text-primary">
                      {sc.btcRequired.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Liquidation row */}
              <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: "1.2fr repeat(4, 1fr)" }}>
                <div className="flex items-center font-mono text-[8.5px] text-text-muted">Liq. Price</div>
                {scenarioRows.map(sc => (
                  <div key={sc.ltv} className="text-center py-2 bg-surface-base border-[1.5px] border-border rounded-lg">
                    <span className="font-mono text-[11px] font-semibold text-text-primary">
                      ${Math.round(sc.liquidationPrice).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Risk Band row */}
              <div className="grid min-w-[320px] gap-1.5" style={{ gridTemplateColumns: "1.2fr repeat(4, 1fr)" }}>
                <div className="flex items-center font-mono text-[8.5px] text-text-muted">Risk Band</div>
                {scenarioRows.map(sc => (
                  <div key={sc.ltv} className="flex items-center justify-center py-2 bg-surface-base border-[1.5px] border-border rounded-lg gap-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: RISK_COLOR[sc.riskBand] }} />
                    <span className="font-mono text-[8.5px] font-semibold"
                      style={{ color: RISK_COLOR[sc.riskBand] }}>
                      {sc.riskBand}
                    </span>
                  </div>
                ))}
              </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleSaveClick}
                className="w-full mt-2 py-2.5 rounded-lg font-mono text-[10px] uppercase
                  tracking-wider text-white font-medium transition-all
                  hover:-translate-y-px active:translate-y-0"
                style={{
                  background: "#F29C22",
                  boxShadow: "0 2px 8px rgba(242,156,34,0.25)",
                }}
              >
                Save Scenario & Create Risk Analysis Report →
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE DROITE */}
        <div className="space-y-4">

          {/* SCORING CRITERIA */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="font-display font-semibold text-[13px] text-text-primary">
                Scoring Criteria
              </div>
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded border"
                style={{ background: "rgba(242,156,34,0.09)", color: "#F29C22", borderColor: "rgba(242,156,34,0.25)" }}>
                Weights
              </span>
            </div>
            <div className="p-4 space-y-2.5">
              {Object.entries(WEIGHTS.BTC).map(([key, weight]) => (
                <BreakdownBar
                  key={key}
                  label={BTC_CRITERIA_LABELS[key] ?? key}
                  value={(weight as number) * 100}
                  color="#F29C22"
                  displayValue={`${((weight as number) * 100).toFixed(0)}%`}
                />
              ))}
            </div>
          </div>

          {/* YIELD BOARD */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div>
                <div className="font-display font-semibold text-[13px]">Yield Board</div>
                <div className="font-mono text-[9px] text-text-muted mt-0.5">
                  Adjusted score {state.durationMonths}m · ×{multiplier.toFixed(2)}
                </div>
              </div>
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded border"
                style={{ background: "rgba(242,156,34,0.09)", color: "#F29C22", borderColor: "rgba(242,156,34,0.25)" }}>
                BTC
              </span>
            </div>
            {!selectedProviderName && (
              <p className="px-4 py-2 font-mono text-[10px] font-semibold text-text-primary bg-surface-base border-b border-border">
                Select a provider to see total and interest by provider.
              </p>
            )}
            <table className="w-full">
              <thead>
                <tr className="bg-surface-base border-b border-border">
                  {["Provider", "Raw", "Adjusted", "APY"].map((h) => (
                    <th key={h} className="text-left px-3 py-2.5 font-mono text-[8.5px] uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {adjustedProviders.map((p, i) => {
                  const isSelected = p.name === selectedProviderName;
                  return (
                  <tr
                    key={i}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => {
                      if (selectedProviderName === p.name) {
                        setSelectedProvider(null);
                      } else {
                        setSelectedProvider(p.name);
                        setField("apr", Math.round(p.apyPercent * 100) / 100);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        if (selectedProviderName === p.name) {
                          setSelectedProvider(null);
                        } else {
                          setSelectedProvider(p.name);
                          setField("apr", Math.round(p.apyPercent * 100) / 100);
                        }
                      }
                    }}
                    className={`border-b border-border last:border-0 transition-colors cursor-pointer ${
                      isSelected ? "bg-amber-50 ring-1 ring-amber-200/80" : "hover:bg-surface-elevated"
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div>
                        <div className="font-medium text-[12px] text-text-primary">{p.name}</div>
                        <div className="font-mono text-[9px] text-text-muted">{p.type}</div>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-text-muted line-through">
                      {p.score}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-mono text-[12px] font-semibold"
                          style={{
                            color: p.adjustedScore >= 70 ? "#059669" : p.adjustedScore >= 55 ? "#D97706" : "#EA580C",
                          }}
                        >
                          {p.adjustedScore}
                        </span>
                        <div className="w-8 h-1 bg-surface-hover rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${p.adjustedScore}%`,
                              background: p.adjustedScore >= 70 ? "#059669" : p.adjustedScore >= 55 ? "#D97706" : "#EA580C",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-[11.5px] font-semibold text-risk-low">
                      {p.apy}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border bg-surface-base flex items-center gap-3">
              <span className="font-mono text-[8px] text-text-muted uppercase tracking-wider">Legend</span>
              <span className="font-mono text-[8.5px] text-text-muted line-through">Raw score</span>
              <span className="font-mono text-[8.5px]" style={{ color: "#059669" }}>Score × duration mult.</span>
            </div>
          </div>

          {/* DURATION MULTIPLIER */}
          <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
              <div className="font-display font-semibold text-[13px]">Duration Multiplier</div>
              <span className="font-mono text-[8.5px] px-2 py-0.5 rounded border"
                style={{ background: "rgba(242,156,34,0.09)", color: "#F29C22", borderColor: "rgba(242,156,34,0.25)" }}>
                ×{multiplier.toFixed(2)} active
              </span>
            </div>
            <div className="p-4 space-y-1.5">
              {DURATION_ROWS.map((row) => {
                const isActive = state.durationMonths >= row.min && state.durationMonths <= row.max;
                return (
                  <div key={row.label}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                      isActive
                        ? "border border-amber-200"
                        : "border border-transparent hover:bg-surface-elevated"
                    }`}
                    style={isActive ? { background: "rgba(242,156,34,0.06)" } : undefined}>
                    <span className={`font-mono text-[9.5px] min-w-[108px] ${
                      isActive ? "font-semibold" : "text-text-secondary"
                    }`}
                    style={isActive ? { color: "#F29C22" } : undefined}>
                      {row.label}{isActive ? " ◀" : ""}
                    </span>
                    <div className="flex-1 h-1 bg-surface-hover rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${row.mult * 100}%`, background: "#F29C22" }} />
                    </div>
                    <span className={`font-mono text-[10px] font-semibold min-w-[36px] text-right ${
                      isActive ? "" : "text-text-primary"
                    }`}
                    style={isActive ? { color: "#F29C22" } : undefined}>
                      ×{row.mult.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              <div className="mt-3 p-3 rounded-lg border-l-[3px] text-[11.5px] text-text-secondary leading-relaxed"
                style={{ background: "var(--color-surface-base)", borderLeftColor: "#F29C22" }}>
                <div className="font-mono text-[8.5px] uppercase tracking-wider mb-1"
                  style={{ color: "#F29C22" }}>Rule</div>
                Multiplier can only reduce score, never increase. Applied after raw score computation.
              </div>
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <ClientInfoModal
          module="1A"
          defaultClientName={clientInfo?.clientName ?? user?.name ?? ""}
          onConfirm={handleModalConfirm}
          onCancel={() => { if (!generating) setShowModal(false); }}
          generating={generating}
        />
      )}
    </div>
  );
}