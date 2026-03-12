"use client";

import { useState, useEffect } from "react";
import type { ClientInfo } from "@/context/PlannerContext";

const RISK_OPTIONS: ClientInfo["riskPreference"][] = [
  "Conservative",
  "Moderate",
  "Aggressive",
];

export function ClientInfoModal({
  module,
  defaultClientName = "",
  onConfirm,
  onCancel,
  generating = false,
}: {
  module: string;
  defaultClientName?: string;
  onConfirm: (info: ClientInfo) => void | Promise<void>;
  onCancel: () => void;
  generating?: boolean;
}) {
  const [clientName, setClientName] = useState(defaultClientName);
  const [riskPreference, setRiskPreference] =
    useState<ClientInfo["riskPreference"]>("Moderate");

  useEffect(() => {
    setClientName(defaultClientName);
  }, [defaultClientName]);

  const moduleLabel = module === "1A" ? "BTC" : module === "1B" ? "Fiat" : module === "1C" ? "Stablecoin" : module;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ clientName, riskPreference });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-info-title"
    >
      <div
        className="w-full max-w-md rounded-lg border border-border bg-surface-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="client-info-title"
          className="font-heading text-sm font-semibold uppercase tracking-wider text-text-primary"
        >
          Client info — {moduleLabel}
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="client-name"
              className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted"
            >
              Client name
            </label>
            <input
              id="client-name"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
              className="w-full rounded border border-border bg-surface-base px-3 py-2 font-mono text-sm text-text-primary"
            />
          </div>
          <div>
            <label
              htmlFor="risk-preference"
              className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-text-muted"
            >
              Risk preference
            </label>
            <select
              id="risk-preference"
              value={riskPreference}
              onChange={(e) =>
                setRiskPreference(e.target.value as ClientInfo["riskPreference"])
              }
              className="w-full rounded border border-border bg-surface-base px-3 py-2 font-mono text-sm text-text-primary"
            >
              {RISK_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={generating}
              className="flex-1 rounded-lg border border-border bg-surface-elevated py-2.5 font-mono text-[10px] uppercase tracking-wider text-text-secondary hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="flex-1 rounded-lg py-2.5 font-mono text-[10px] uppercase tracking-wider text-white transition-all hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#4F46E5",
                boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
              }}
            >
              {generating ? "Generating…" : "Confirm & Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
