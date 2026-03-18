"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const EXPLORER_FEATURES = [
  "Bitcoin, fiat, and stablecoin income planners",
  "Save 1 scenario",
  "Basic risk overview",
  "Yield Board preview",
  "Limited filtering options",
];

const PRO_FEATURES = [
  "Unlimited income scenarios",
  "Full risk intelligence and scoring analysis",
  "Complete Yield Board access",
  "Strategy comparison tools",
  "Full provider and instrument details",
  "Exportable risk analysis reports (PDF)",
  "Alerts and monitoring",
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-20 bg-surface-base px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            Access <span className="text-[var(--primary)]">DCC</span>
          </h2>
          <p className="mt-2 text-text-secondary">
            Designed for investors who want greater transparency when evaluating digital yield strategies.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnnual(true)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              annual ? "bg-[var(--primary)] text-white" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            Annually
          </button>
          <span className="text-sm text-text-muted">or</span>
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              !annual ? "bg-[var(--primary)] text-white" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            }`}
          >
            Monthly
          </button>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          {/* Explorer */}
          <div className="rounded-xl border border-border bg-surface-card p-8 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-text-primary">Explorer</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Explore the DCC platform and run initial income simulations.
            </p>
            <p className="mt-2 text-4xl font-bold text-text-primary">$0</p>
            <ul className="mt-6 space-y-3">
              {EXPLORER_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="h-5 w-5 shrink-0 text-risk-low" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="mt-8 block w-full rounded-lg bg-[var(--primary)] py-3 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Start Exploring
            </Link>
          </div>

          {/* DCC Pro */}
          <div className="relative rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)] p-8 shadow-sm">
            <div className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-primary">
              Most Popular
            </div>
            <h3 className="font-heading text-xl font-bold text-white">DCC Pro</h3>
            <p className="mt-1 text-sm text-white/90">
              Unlock the full analytical capabilities of Digital Credit Compass.
            </p>
            <div className="mt-4">
              {annual ? (
                <>
                  <p className="text-4xl font-bold text-white">
                    $30 <span className="text-lg font-normal text-white/90">/ month</span>
                  </p>
                  <p className="mt-1 text-sm text-white/80">billed annually ($360/year)</p>
                  <p className="mt-0.5 text-xs font-medium text-white/90">Save $108 per year</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-white">$39</p>
                  <p className="mt-1 text-sm text-white/80">monthly</p>
                </>
              )}
            </div>
            <ul className="mt-6 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/95">
                  <Check className="h-5 w-5 shrink-0 text-white" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-8 block w-full rounded-lg bg-white py-3 text-center text-sm font-medium text-[var(--primary)] transition-opacity hover:opacity-90"
            >
              Unlock Full Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
