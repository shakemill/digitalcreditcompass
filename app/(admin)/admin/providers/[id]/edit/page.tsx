"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Award, Bot, CheckCircle2 } from "lucide-react";

type Provider = {
  id: string;
  name: string;
  slug: string;
  plannerType: "BTC" | "FIAT" | "STABLECOIN";
  domicile: string;
  jurisdictionTier: string;
  isActive: boolean;
  apyMin: number | null;
  apyMax: number | null;
  maxLtv: number | null;
  liquidationLtv: number | null;
  rehypothecation: string;
  providerCategory?: string | null;
  stablecoinTypes?: string[] | null;
  pegType?: string | null;
  notes?: string | null;
  latestScoringInput?: Record<string, unknown> | null;
};

const BTC_KEYS = ["transparency", "collateralControl", "jurisdiction", "structuralRisk", "trackRecord"];
const FIAT_KEYS = ["marketVolatility", "incomeMechanism", "seniority", "complexity", "providerQuality", "hv30"];
const STABLECOIN_KEYS = ["reserveQuality", "yieldTransparency", "counterpartyRisk", "liquidity"];

const CRITERIA_LABELS: Record<string, string> = {
  transparency: "Transparency",
  collateralControl: "Collateral Control",
  jurisdiction: "Jurisdiction",
  structuralRisk: "Structural Risk",
  trackRecord: "Track Record",
  marketVolatility: "Market Volatility",
  incomeMechanism: "Income Mechanism",
  seniority: "Seniority",
  complexity: "Complexity",
  providerQuality: "Provider Quality",
  hv30: "HV30 (%)",
  reserveQuality: "Reserve Quality",
  yieldTransparency: "Yield Transparency",
  counterpartyRisk: "Counterparty Risk",
  liquidity: "Liquidity",
};

function toNum(v: unknown): number {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

export default function EditProviderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [identity, setIdentity] = useState<Record<string, unknown>>({});
  const [criteria, setCriteria] = useState<Record<string, number>>({});
  const [agentRunning, setAgentRunning] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/providers/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProvider(null);
          return;
        }
        setProvider(data);
        setIdentity({
          name: data.name,
          slug: data.slug,
          domicile: data.domicile,
          jurisdictionTier: data.jurisdictionTier,
          isActive: data.isActive,
          apyMin: data.apyMin,
          apyMax: data.apyMax,
          maxLtv: data.maxLtv,
          liquidationLtv: data.liquidationLtv,
          rehypothecation: data.rehypothecation,
          providerCategory: data.providerCategory ?? null,
          stablecoinTypes: Array.isArray(data.stablecoinTypes) ? data.stablecoinTypes : null,
          pegType: data.pegType ?? null,
          notes: data.notes ?? null,
        });
        const input = data.latestScoringInput || {};
        const next: Record<string, number> = {};
        [...BTC_KEYS, ...FIAT_KEYS, ...STABLECOIN_KEYS].forEach((k) => {
          if (input[k] != null) next[k] = toNum(input[k]);
        });
        setCriteria(next);
      })
      .catch(() => setProvider(null))
      .finally(() => setLoading(false));
  }, [id]);

  const saveIdentity = async () => {
    if (!id || !provider) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        name: identity.name,
        slug: identity.slug,
        domicile: identity.domicile,
        jurisdictionTier: identity.jurisdictionTier,
        isActive: !!identity.isActive,
        apyMin: identity.apyMin != null ? Number(identity.apyMin) : null,
        apyMax: identity.apyMax != null ? Number(identity.apyMax) : null,
        maxLtv: identity.maxLtv != null ? Number(identity.maxLtv) : null,
        liquidationLtv: identity.liquidationLtv != null ? Number(identity.liquidationLtv) : null,
        rehypothecation: (identity.rehypothecation as string) ?? "NO",
        providerCategory: identity.providerCategory ?? null,
        stablecoinTypes: Array.isArray(identity.stablecoinTypes) ? identity.stablecoinTypes : null,
        pegType: identity.pegType ?? null,
        notes: identity.notes ?? null,
      };
      const res = await fetch(`/api/providers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const msg = d?.error?.message ?? (Array.isArray(d?.error) ? d.error.map((e: { path?: string[]; message?: string }) => e.message || JSON.stringify(e)).join(", ") : null);
        setError(msg || "Failed to save");
        return;
      }
      const data = await res.json();
      setProvider((p) => (p ? { ...p, ...data } : null));
      setSuccess("Identity saved.");
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  const saveCriteria = async () => {
    if (!id || !provider) return;
    setSaving(true);
    setError("");
    setSuccess("");
    const pt = provider.plannerType;
    const payload: Record<string, unknown> = { plannerType: pt };
    if (pt === "BTC") {
      payload.btc = {
        transparency: criteria.transparency ?? 0,
        collateralControl: criteria.collateralControl ?? 0,
        jurisdiction: criteria.jurisdiction ?? 0,
        structuralRisk: criteria.structuralRisk ?? 0,
        trackRecord: criteria.trackRecord ?? 0,
      };
    } else if (pt === "FIAT") {
      payload.fiat = {
        marketVolatility: criteria.marketVolatility ?? 0,
        incomeMechanism: criteria.incomeMechanism ?? 0,
        seniority: criteria.seniority ?? 0,
        complexity: criteria.complexity ?? 0,
        providerQuality: criteria.providerQuality ?? 0,
        hv30: criteria.hv30,
      };
    } else {
      payload.stablecoin = {
        reserveQuality: criteria.reserveQuality ?? 0,
        yieldTransparency: criteria.yieldTransparency ?? 0,
        counterpartyRisk: criteria.counterpartyRisk ?? 0,
        liquidity: criteria.liquidity ?? 0,
      };
    }
    try {
      const hasExisting = provider.latestScoringInput != null;
      const res = await fetch(`/api/providers/${id}/scoring-input`, {
        method: hasExisting ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d?.error?.message || "Failed to save criteria");
        return;
      }
      const data = await res.json();
      setProvider((p) => (p ? { ...p, latestScoringInput: data } : null));
      setCriteria((prev) => ({ ...prev, ...(data as Record<string, number>) }));
      setSuccess("Scoring criteria saved.");
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  };

  const publishScore = async () => {
    if (!id) return;
    setPublishing(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/providers/${id}/publish-score`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        setError(d?.error || "Publish failed");
        return;
      }
      router.refresh();
      const data = await res.json();
      setSuccess(data?.message || "Score published.");
    } catch {
      setError("Request failed");
    } finally {
      setPublishing(false);
    }
  };

  const runAiAgent = async () => {
    if (!id) return;
    setAgentRunning(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/ai-agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "AI agent run failed");
        return;
      }
      setSuccess("Evidence pack created. Redirecting…");
      setTimeout(() => router.push("/admin/evidence-packs"), 1200);
    } catch {
      setError("Request failed");
    } finally {
      setAgentRunning(false);
    }
  };

  if (loading || !provider) {
    return (
      <div className="rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        {loading ? (
          <p className="text-text-secondary">Loading…</p>
        ) : (
          <p className="text-text-secondary">Provider not found.</p>
        )}
        <Link
          href="/admin/providers"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>
    );
  }

  const keys = provider.plannerType === "BTC" ? BTC_KEYS : provider.plannerType === "FIAT" ? FIAT_KEYS : STABLECOIN_KEYS;
  const requiredKeys = provider.plannerType === "FIAT" ? FIAT_KEYS.filter((k) => k !== "hv30") : keys;
  const allFilled = requiredKeys.every((k) => criteria[k] != null && criteria[k] >= 0 && criteria[k] <= 100);

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
  const labelClass = "block text-sm font-medium text-text-primary";

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to providers
      </Link>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-risk-low bg-risk-low-bg px-4 py-3 text-sm text-risk-low" role="status">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {/* Identity card */}
      <section className="rounded-xl border border-border bg-surface-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Building2 className="h-5 w-5 text-text-muted" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">Identity</h2>
        </div>
        <div className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input
                value={(identity.name as string) ?? ""}
                onChange={(e) => setIdentity((i) => ({ ...i, name: e.target.value }))}
                className={inputClass}
                placeholder="Provider name"
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={(identity.slug as string) ?? ""}
                onChange={(e) => setIdentity((i) => ({ ...i, slug: e.target.value }))}
                className={inputClass}
                placeholder="url-slug"
              />
            </div>
            <div>
              <label className={labelClass}>Domicile</label>
              <input
                value={(identity.domicile as string) ?? ""}
                onChange={(e) => setIdentity((i) => ({ ...i, domicile: e.target.value }))}
                className={inputClass}
                placeholder="e.g. CH, US"
              />
            </div>
            <div>
              <label className={labelClass}>Jurisdiction tier</label>
              <select
                value={(identity.jurisdictionTier as string) ?? "T1"}
                onChange={(e) => setIdentity((i) => ({ ...i, jurisdictionTier: e.target.value }))}
                className={inputClass}
              >
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="UNKNOWN">UNKNOWN</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Rehypothecation</label>
              <select
                value={(identity.rehypothecation as string) ?? "NO"}
                onChange={(e) => setIdentity((i) => ({ ...i, rehypothecation: e.target.value }))}
                className={inputClass}
              >
                <option value="NO">NO</option>
                <option value="DISCLOSED">DISCLOSED</option>
                <option value="UNDISCLOSED">UNDISCLOSED</option>
              </select>
            </div>
            <div className="flex items-center gap-3 sm:items-end">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!identity.isActive}
                  onChange={(e) => setIdentity((i) => ({ ...i, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">Active</span>
              </label>
            </div>
            {provider.plannerType === "STABLECOIN" && (
              <>
                <div className="sm:col-span-2">
                  <span className={labelClass}>Type</span>
                  <div className="mt-2 flex gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="providerCategory"
                        value="CEFI"
                        checked={(identity.providerCategory as string) === "CEFI"}
                        onChange={() => setIdentity((i) => ({ ...i, providerCategory: "CEFI" }))}
                        className="border-border text-primary focus:ring-primary"
                      />
                      CeFi
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="providerCategory"
                        value="DEFI"
                        checked={(identity.providerCategory as string) === "DEFI"}
                        onChange={() => setIdentity((i) => ({ ...i, providerCategory: "DEFI" }))}
                        className="border-border text-primary focus:ring-primary"
                      />
                      DeFi
                    </label>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className={labelClass}>Stablecoin(s)</span>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        checked={
                          Array.isArray(identity.stablecoinTypes) &&
                          identity.stablecoinTypes.length === 1 &&
                          identity.stablecoinTypes[0] === "USDC"
                        }
                        onChange={() => setIdentity((i) => ({ ...i, stablecoinTypes: ["USDC"] }))}
                        className="border-border text-primary focus:ring-primary"
                      />
                      USDC
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        checked={
                          Array.isArray(identity.stablecoinTypes) &&
                          identity.stablecoinTypes.length === 1 &&
                          identity.stablecoinTypes[0] === "USDT"
                        }
                        onChange={() => setIdentity((i) => ({ ...i, stablecoinTypes: ["USDT"] }))}
                        className="border-border text-primary focus:ring-primary"
                      />
                      USDT
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        checked={
                          Array.isArray(identity.stablecoinTypes) &&
                          identity.stablecoinTypes.length === 2
                        }
                        onChange={() => setIdentity((i) => ({ ...i, stablecoinTypes: ["USDC", "USDT"] }))}
                        className="border-border text-primary focus:ring-primary"
                      />
                      USDC & USDT
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Peg type (optional)</label>
                  <input
                    value={(identity.pegType as string) ?? ""}
                    onChange={(e) => setIdentity((i) => ({ ...i, pegType: e.target.value || null }))}
                    className={inputClass}
                    placeholder="e.g. Fiat-backed, Fiat / Crypto"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Notes (optional)</label>
                  <textarea
                    value={(identity.notes as string) ?? ""}
                    onChange={(e) => setIdentity((i) => ({ ...i, notes: e.target.value || null }))}
                    rows={3}
                    className={inputClass}
                  />
                </div>
              </>
            )}
            {(provider.plannerType === "BTC" || provider.plannerType === "FIAT" || provider.plannerType === "STABLECOIN") && (
              <>
                <div>
                  <label className={labelClass}>APY Min (decimal, e.g. 0.05)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={identity.apyMin != null ? Number(identity.apyMin) : ""}
                    onChange={(e) => setIdentity((i) => ({ ...i, apyMin: e.target.value === "" ? null : parseFloat(e.target.value) }))}
                    className={inputClass}
                    placeholder="—"
                  />
                </div>
                <div>
                  <label className={labelClass}>APY Max (decimal)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={identity.apyMax != null ? Number(identity.apyMax) : ""}
                    onChange={(e) => setIdentity((i) => ({ ...i, apyMax: e.target.value === "" ? null : parseFloat(e.target.value) }))}
                    className={inputClass}
                    placeholder="—"
                  />
                </div>
                {(provider.plannerType === "BTC") && (
                  <>
                    <div>
                      <label className={labelClass}>Max LTV (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={identity.maxLtv != null ? Number(identity.maxLtv) : ""}
                        onChange={(e) => setIdentity((i) => ({ ...i, maxLtv: e.target.value === "" ? null : parseFloat(e.target.value) }))}
                        className={inputClass}
                        placeholder="—"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Liquidation LTV (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={identity.liquidationLtv != null ? Number(identity.liquidationLtv) : ""}
                        onChange={(e) => setIdentity((i) => ({ ...i, liquidationLtv: e.target.value === "" ? null : parseFloat(e.target.value) }))}
                        className={inputClass}
                        placeholder="—"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={saveIdentity}
            disabled={saving}
            className="mt-5 rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save identity"}
          </button>
        </div>
      </section>

      {/* Scoring criteria card */}
      <section className="rounded-xl border border-border bg-surface-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Award className="h-5 w-5 text-text-muted" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">Scoring criteria</h2>
          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">0–100</span>
        </div>
        <div className="p-5">
          <p className="mb-4 text-sm text-text-secondary">
            All required fields must be set before publishing a score snapshot. Values are 0–100.
          </p>
          <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {keys.map((k) => (
              <div key={k}>
                <label className={labelClass}>{CRITERIA_LABELS[k] ?? k}</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={criteria[k] ?? ""}
                    onChange={(e) => setCriteria((c) => ({ ...c, [k]: parseFloat(e.target.value) || 0 }))}
                    className={inputClass}
                  />
                  <div className="h-2 w-16 shrink-0 overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-200"
                      style={{ width: `${Math.min(100, Math.max(0, criteria[k] ?? 0))}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveCriteria}
              disabled={saving}
              className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save criteria"}
            </button>
            <button
              type="button"
              onClick={publishScore}
              disabled={publishing || !allFilled}
              title={!allFilled ? "Fill all required criteria (0–100) first" : undefined}
              className="rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish score snapshot"}
            </button>
            {!allFilled && (
              <span className="flex items-center text-xs text-text-muted">
                Fill all required criteria to enable publish.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* AI Agent card */}
      <section className="rounded-xl border border-border bg-surface-card shadow-sm">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Bot className="h-5 w-5 text-text-muted" />
          <h2 className="font-heading text-lg font-semibold text-text-primary">AI Agent</h2>
        </div>
        <div className="p-5">
          <p className="mb-4 text-sm text-text-secondary">
            Run the evidence extraction pipeline for this provider. Creates an evidence pack in the review queue for admin approval.
          </p>
          <button
            type="button"
            onClick={runAiAgent}
            disabled={agentRunning}
            className="rounded-lg border border-border bg-surface-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover disabled:opacity-50"
          >
            {agentRunning ? "Running…" : "Run AI Agent (create evidence pack)"}
          </button>
        </div>
      </section>
    </div>
  );
}
