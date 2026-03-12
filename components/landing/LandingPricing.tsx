"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "Save 1 scenario",
  "Basic risk overview",
  "Yield Board preview",
  "Limited filters",
];

const PRO_FEATURES = [
  "Unlimited income scenarios",
  "Full risk intelligence",
  "Full Yield Board access",
  "Strategy comparison",
  "Full instrument details",
  "PDF report export",
  "Alerts & monitoring",
];

export function LandingPricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="scroll-mt-20 bg-surface-base px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            Our Pricing <span className="text-[var(--primary)]">Plans</span>
          </h2>
          <p className="mt-2 text-text-secondary">
            Flexible pricing options designed to meet your needs—whether you&apos;re just getting started or scaling up.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnnual(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !annual ? "bg-[var(--primary)] text-white" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Monthly
          </button>
          <div className="relative flex items-center">
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className={`relative h-7 w-12 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                annual ? "bg-[var(--primary)]" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                  annual ? "left-6" : "left-1"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`ml-2 text-sm font-medium ${annual ? "text-[var(--primary)]" : "text-text-secondary hover:text-text-primary"}`}
            >
              Annually
            </button>
            {annual && (
              <span className="ml-2 rounded bg-[var(--primary)]/20 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                SAVE 20%
              </span>
            )}
          </div>
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-6">
          <div className="rounded-xl border border-border bg-surface-card p-8 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-text-primary">Free</h3>
            <p className="mt-1 text-sm text-text-secondary">Bitcoin, USD, and Stablecoin income planner</p>
            <p className="mt-2 text-4xl font-bold text-text-primary">$0</p>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
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
              Start Free
            </Link>
          </div>
          <div className="relative rounded-xl border-2 border-[var(--primary)] bg-[var(--primary)] p-8 shadow-sm">
            <div className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-primary">
              MOST POPULAR
            </div>
            <h3 className="font-heading text-xl font-bold text-white">PRO</h3>
            <p className="mt-2 text-4xl font-bold text-white">
              $360
              <span className="text-lg font-normal text-white/90">/yr USD</span>
            </p>
            <p className="mt-1 text-sm text-white/80">$30/month billed annually (USD)</p>
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
              Activate Full Access
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
