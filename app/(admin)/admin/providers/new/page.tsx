"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProviderPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
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
  });

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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error?.message || JSON.stringify(data?.error) || "Failed");
        return;
      }
      router.push(`/admin/providers/${data.id}/edit`);
      router.refresh();
    } catch {
      setError("Request failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">New provider</h1>
      <p className="mt-1 text-gray-600">Create a provider, then add scoring criteria and publish a snapshot.</p>
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Planner type</label>
          <select
            value={form.plannerType}
            onChange={(e) => setForm((f) => ({ ...f, plannerType: e.target.value as typeof form.plannerType }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="BTC">BTC</option>
            <option value="FIAT">FIAT</option>
            <option value="STABLECOIN">STABLECOIN</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Domicile</label>
          <input
            required
            value={form.domicile}
            onChange={(e) => setForm((f) => ({ ...f, domicile: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Jurisdiction tier</label>
          <select
            value={form.jurisdictionTier}
            onChange={(e) => setForm((f) => ({ ...f, jurisdictionTier: e.target.value as typeof form.jurisdictionTier }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="T1">T1</option>
            <option value="T2">T2</option>
            <option value="T3">T3</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">APY Min</label>
            <input
              type="number"
              step="any"
              value={form.apyMin}
              onChange={(e) => setForm((f) => ({ ...f, apyMin: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">APY Max</label>
            <input
              type="number"
              step="any"
              value={form.apyMax}
              onChange={(e) => setForm((f) => ({ ...f, apyMax: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max LTV</label>
            <input
              type="number"
              step="any"
              value={form.maxLtv}
              onChange={(e) => setForm((f) => ({ ...f, maxLtv: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Liquidation LTV</label>
            <input
              type="number"
              step="any"
              value={form.liquidationLtv}
              onChange={(e) => setForm((f) => ({ ...f, liquidationLtv: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rehypothecation</label>
          <select
            value={form.rehypothecation}
            onChange={(e) => setForm((f) => ({ ...f, rehypothecation: e.target.value as typeof form.rehypothecation }))}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="NO">NO</option>
            <option value="DISCLOSED">DISCLOSED</option>
            <option value="UNDISCLOSED">UNDISCLOSED</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create provider"}
          </button>
          <Link
            href="/admin/providers"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
