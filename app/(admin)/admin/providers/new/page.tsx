"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Percent, Shield, CircleDollarSign } from "lucide-react";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
const labelClass = "block text-sm font-medium text-text-primary";
const selectClass =
  "mt-1.5 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export default function NewProviderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    plannerType: "BTC" as "BTC" | "FIAT" | "STABLECOIN",
    domicile: "CH",
    jurisdictionTier: "T1" as "T1" | "T2" | "T3" | "UNKNOWN",
    isActive: true,
    apyMin: "" as string | number,
    apyMax: "",
    maxLtv: "",
    liquidationLtv: "",
    rehypothecation: "NO" as "NO" | "DISCLOSED" | "UNDISCLOSED",
    providerCategory: "" as "" | "CEFI" | "DEFI",
    stablecoinTypes: "USDC" as "USDC" | "USDT" | "BOTH",
    pegType: "",
    notes: "",
  });

  const handleNameChange = useCallback((name: string) => {
    setForm((f) => {
      const next = { ...f, name };
      if (!slugManuallyEdited) next.slug = slugify(name);
      return next;
    });
  }, [slugManuallyEdited]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          plannerType: form.plannerType,
          domicile: form.domicile,
          jurisdictionTier: form.jurisdictionTier,
          isActive: form.isActive,
          apyMin: form.apyMin === "" ? undefined : Number(form.apyMin),
          apyMax: form.apyMax === "" ? undefined : Number(form.apyMax),
          maxLtv: form.maxLtv === "" ? undefined : Number(form.maxLtv),
          liquidationLtv: form.liquidationLtv === "" ? undefined : Number(form.liquidationLtv),
          rehypothecation: form.rehypothecation,
          ...(form.plannerType === "STABLECOIN" && {
            providerCategory: form.providerCategory || undefined,
            stablecoinTypes: form.stablecoinTypes === "BOTH" ? ["USDC", "USDT"] : form.stablecoinTypes === "USDC" ? ["USDC"] : form.stablecoinTypes === "USDT" ? ["USDT"] : undefined,
            pegType: form.pegType || undefined,
            notes: form.notes || undefined,
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || JSON.stringify(data?.error) || "Failed to create provider");
        return;
      }
      router.push(`/admin/providers/${data.id}/edit`);
      router.refresh();
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <Link
        href="/admin/providers"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to providers
      </Link>

      <h1 className="font-heading text-2xl font-semibold text-text-primary">New provider</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Create a provider, then add scoring criteria and publish a snapshot from the edit page.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-risk-high bg-risk-high-bg px-4 py-3 text-sm text-risk-high"
          >
            {error}
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface-card shadow-sm">
          {/* Identity */}
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Building2 className="h-5 w-5 text-text-muted" />
            <h2 className="font-heading text-lg font-semibold text-text-primary">Identity</h2>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label htmlFor="name" className={labelClass}>
                Name
              </label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="e.g. Acme Custody"
              />
            </div>
            <div>
              <label htmlFor="slug" className={labelClass}>
                Slug
              </label>
              <input
                id="slug"
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                className={inputClass}
                placeholder="e.g. acme-custody"
              />
              <p className="mt-1 text-xs text-text-muted">URL-friendly identifier. Auto-filled from name unless you change it.</p>
            </div>
            <div>
              <label htmlFor="plannerType" className={labelClass}>
                Planner type
              </label>
              <select
                id="plannerType"
                value={form.plannerType}
                onChange={(e) => setForm((f) => ({ ...f, plannerType: e.target.value as typeof form.plannerType }))}
                className={selectClass}
              >
                <option value="BTC">BTC</option>
                <option value="FIAT">Fiat</option>
                <option value="STABLECOIN">Stablecoin</option>
              </select>
            </div>
          </div>

          {/* Location & status */}
          <div className="flex items-center gap-2 border-t border-border px-5 py-4">
            <MapPin className="h-5 w-5 text-text-muted" />
            <h2 className="font-heading text-lg font-semibold text-text-primary">Location & status</h2>
          </div>
          <div className="space-y-4 p-5 pt-0">
            <div>
              <label htmlFor="domicile" className={labelClass}>
                Domicile
              </label>
              <input
                id="domicile"
                required
                value={form.domicile}
                onChange={(e) => setForm((f) => ({ ...f, domicile: e.target.value }))}
                className={inputClass}
                placeholder="e.g. CH, US, SG"
              />
              <p className="mt-1 text-xs text-text-muted">Country code (e.g. CH, US).</p>
            </div>
            <div>
              <label htmlFor="jurisdictionTier" className={labelClass}>
                Jurisdiction tier
              </label>
              <select
                id="jurisdictionTier"
                value={form.jurisdictionTier}
                onChange={(e) => setForm((f) => ({ ...f, jurisdictionTier: e.target.value as typeof form.jurisdictionTier }))}
                className={selectClass}
              >
                <option value="T1">T1</option>
                <option value="T2">T2</option>
                <option value="T3">T3</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-text-primary">Active</span>
            </label>
          </div>

          {/* Yield & risk */}
          <div className="flex items-center gap-2 border-t border-border px-5 py-4">
            <Percent className="h-5 w-5 text-text-muted" />
            <h2 className="font-heading text-lg font-semibold text-text-primary">Yield & risk (optional)</h2>
          </div>
          <div className="grid gap-4 p-5 pt-0 sm:grid-cols-2">
            <div>
              <label htmlFor="apyMin" className={labelClass}>
                APY min (%)
              </label>
              <input
                id="apyMin"
                type="number"
                step="any"
                value={form.apyMin}
                onChange={(e) => setForm((f) => ({ ...f, apyMin: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="apyMax" className={labelClass}>
                APY max (%)
              </label>
              <input
                id="apyMax"
                type="number"
                step="any"
                value={form.apyMax}
                onChange={(e) => setForm((f) => ({ ...f, apyMax: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="maxLtv" className={labelClass}>
                Max LTV (%)
              </label>
              <input
                id="maxLtv"
                type="number"
                step="any"
                value={form.maxLtv}
                onChange={(e) => setForm((f) => ({ ...f, maxLtv: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="liquidationLtv" className={labelClass}>
                Liquidation LTV (%)
              </label>
              <input
                id="liquidationLtv"
                type="number"
                step="any"
                value={form.liquidationLtv}
                onChange={(e) => setForm((f) => ({ ...f, liquidationLtv: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* Rehypothecation */}
          <div className="flex items-center gap-2 border-t border-border px-5 py-4">
            <Shield className="h-5 w-5 text-text-muted" />
            <h2 className="font-heading text-lg font-semibold text-text-primary">Rehypothecation</h2>
          </div>
          <div className="p-5 pt-0">
            <label htmlFor="rehypothecation" className={labelClass}>
              Rehypothecation
            </label>
            <select
              id="rehypothecation"
              value={form.rehypothecation}
              onChange={(e) => setForm((f) => ({ ...f, rehypothecation: e.target.value as typeof form.rehypothecation }))}
              className={selectClass}
            >
              <option value="NO">No</option>
              <option value="DISCLOSED">Disclosed</option>
              <option value="UNDISCLOSED">Undisclosed</option>
            </select>
          </div>

          {form.plannerType === "STABLECOIN" && (
            <>
              <div className="flex items-center gap-2 border-t border-border px-5 py-4">
                <CircleDollarSign className="h-5 w-5 text-text-muted" />
                <h2 className="font-heading text-lg font-semibold text-text-primary">Stablecoin</h2>
              </div>
              <div className="space-y-4 p-5 pt-0">
                <div>
                  <span className={labelClass}>Type</span>
                  <div className="mt-2 flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="providerCategory"
                        value="CEFI"
                        checked={form.providerCategory === "CEFI"}
                        onChange={() => setForm((f) => ({ ...f, providerCategory: "CEFI" }))}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">CeFi</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="providerCategory"
                        value="DEFI"
                        checked={form.providerCategory === "DEFI"}
                        onChange={() => setForm((f) => ({ ...f, providerCategory: "DEFI" }))}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">DeFi</span>
                    </label>
                  </div>
                </div>
                <div>
                  <span className={labelClass}>Stablecoin(s)</span>
                  <div className="mt-2 flex flex-wrap gap-6">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        value="USDC"
                        checked={form.stablecoinTypes === "USDC"}
                        onChange={() => setForm((f) => ({ ...f, stablecoinTypes: "USDC" }))}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">USDC</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        value="USDT"
                        checked={form.stablecoinTypes === "USDT"}
                        onChange={() => setForm((f) => ({ ...f, stablecoinTypes: "USDT" }))}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">USDT</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="stablecoinTypes"
                        value="BOTH"
                        checked={form.stablecoinTypes === "BOTH"}
                        onChange={() => setForm((f) => ({ ...f, stablecoinTypes: "BOTH" }))}
                        className="h-4 w-4 border-border text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-text-primary">USDC & USDT</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="pegType" className={labelClass}>
                    Peg type (optional)
                  </label>
                  <input
                    id="pegType"
                    value={form.pegType}
                    onChange={(e) => setForm((f) => ({ ...f, pegType: e.target.value }))}
                    placeholder="e.g. Fiat-backed, Fiat / Crypto"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="notes" className={labelClass}>
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className={inputClass}
                    placeholder="Internal notes about this stablecoin provider"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-text-primary px-4 py-2.5 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create provider"}
          </button>
          <Link
            href="/admin/providers"
            className="rounded-lg border border-border bg-surface-card px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
