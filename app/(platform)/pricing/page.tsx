"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { useSession } from "@/hooks/useSession";

type BillingInterval = "month" | "year";

type Plan = {
  id: string;
  slug: string;
  name: string;
  priceYearCents: number;
  priceMonthCents: number;
  stripePriceIdYear: string | null;
  stripePriceIdMonth: string | null;
};

/** Card brand logos for Stripe (Visa, Mastercard, Amex) */
function AcceptedCardsStrip() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-text-muted" aria-label="Accepted payment methods">
      <span className="text-xs font-medium">Cards accepted</span>
      <div className="flex items-center gap-3">
        <span className="sr-only">Visa</span>
        <svg viewBox="0 0 48 16" className="h-4 w-12 shrink-0" aria-hidden role="img">
          <rect width="48" height="16" rx="2" fill="#1A1F71" />
          <text x="24" y="12" fill="white" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="Arial,sans-serif">VISA</text>
        </svg>
        <span className="sr-only">Mastercard</span>
        <svg viewBox="0 0 48 16" className="h-4 w-12 shrink-0" aria-hidden role="img">
          <circle cx="16" cy="8" r="6" fill="#EB001B" />
          <circle cx="32" cy="8" r="6" fill="#F79E1B" />
          <path d="M24 4.2a6 6 0 0 1 2.5 5 6 6 0 0 1-2.5 5 6 6 0 0 1-2.5-5 6 6 0 0 1 2.5-5z" fill="#FF5F00" opacity="0.9" />
        </svg>
        <span className="sr-only">American Express</span>
        <svg viewBox="0 0 48 16" className="h-4 w-12 shrink-0" aria-hidden role="img">
          <rect width="48" height="16" rx="2" fill="#006FCF" />
          <text x="24" y="11" fill="white" fontSize="6" fontWeight="700" textAnchor="middle" fontFamily="Arial,sans-serif">AMEX</text>
        </svg>
      </div>
    </div>
  );
}

function BillingTabs({
  interval,
  onIntervalChange,
}: {
  interval: BillingInterval;
  onIntervalChange: (v: BillingInterval) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Billing period"
      className="inline-flex rounded-lg border border-border bg-surface-elevated p-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={interval === "month"}
        onClick={() => onIntervalChange("month")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          interval === "month"
            ? "bg-[var(--primary)] text-white shadow-sm"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={interval === "year"}
        onClick={() => onIntervalChange("year")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          interval === "year"
            ? "bg-[var(--primary)] text-white shadow-sm"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
        }`}
      >
        Annual
      </button>
    </div>
  );
}

export default function PricingPage() {
  const { user, loading: sessionLoading } = useSession();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("year");

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  async function handleStripeCheckout(interval: "year" | "month") {
    const pro = plans.find((p) => p.slug === "pro");
    if (!pro) return;
    const priceId = interval === "year" ? pro.stripePriceIdYear : pro.stripePriceIdMonth;
    if (!priceId) return;
    setCheckoutError(null);
    setCheckoutLoading(interval);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }
      setCheckoutError(typeof data?.error === "string" ? data.error : res.statusText || "Checkout failed");
      setCheckoutLoading(null);
    } catch {
      setCheckoutError("Request failed");
      setCheckoutLoading(null);
    }
  }

  const whopCheckoutAnnual = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_ANNUAL?.trim() || process.env.NEXT_PUBLIC_WHOP_PRO_URL?.trim();
  const whopCheckoutMonthly = process.env.NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY?.trim();
  const whopUrlForInterval = billingInterval === "year" ? whopCheckoutAnnual : (whopCheckoutMonthly || whopCheckoutAnnual);
  const hasWhopUrl = !!(whopUrlForInterval && whopUrlForInterval !== "#");
  const isFree = user?.role === "FREE";
  const isProOrAdmin = user?.role === "PRO" || user?.role === "SUPER_ADMIN";

  if (loading || sessionLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-text-secondary">Loading…</p>
      </div>
    );
  }

  const freePlan = plans.find((p) => p.slug === "free");
  const proPlan = plans.find((p) => p.slug === "pro");

  // Compte FREE : upgrade PRO avec onglets Monthly / Annual
  if (isFree) {
    const priceYear = (proPlan?.priceYearCents ?? 36000) / 100;
    const priceMonth = (proPlan?.priceMonthCents ?? 4500) / 100;
    const showStripeYear = proPlan?.stripePriceIdYear;
    const showStripeMonth = proPlan?.stripePriceIdMonth;
    const canCheckout = billingInterval === "year" ? showStripeYear : showStripeMonth;

    return (
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">Upgrade to PRO</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Unlock unlimited scenarios, full Yield Board, PDF export and more.
          </p>
        </div>

        <div className="rounded-xl border-2 border-[var(--primary)] bg-surface-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-semibold text-text-primary">{proPlan?.name ?? "PRO"}</h3>
              <Zap className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <BillingTabs interval={billingInterval} onIntervalChange={setBillingInterval} />
          </div>

          <div className="mt-6">
            {billingInterval === "year" ? (
              <p className="text-2xl font-semibold text-text-primary">
                {priceYear} USD
                <span className="text-sm font-normal text-text-muted"> / year</span>
              </p>
            ) : (
              <p className="text-2xl font-semibold text-text-primary">
                {priceMonth} USD
                <span className="text-sm font-normal text-text-muted"> / month</span>
              </p>
            )}
            {billingInterval === "year" && (
              <p className="mt-1 text-sm text-text-muted">
                {(priceYear / 12).toFixed(2)} USD per month, billed annually
              </p>
            )}
          </div>

          <ul className="mt-6 space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Unlimited income scenarios
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Full risk intelligence
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Full Yield Board access
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              PDF report export
            </li>
          </ul>

          {checkoutError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400" role="alert">
              {checkoutError}
            </p>
          )}
          {canCheckout && (
            <div className="mt-6">
              <AcceptedCardsStrip />
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {canCheckout && (
              <button
                type="button"
                disabled={!!checkoutLoading}
                onClick={() => handleStripeCheckout(billingInterval)}
                className="w-full rounded-lg bg-[var(--primary)] py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {checkoutLoading ? "Redirecting…" : billingInterval === "year" ? "Subscribe annually — Stripe" : "Subscribe monthly — Stripe"}
              </button>
            )}
            {hasWhopUrl && (
              <a
                href={whopUrlForInterval}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg border border-border py-3 text-center text-sm font-medium text-text-primary hover:bg-surface-hover"
              >
                {billingInterval === "year" ? "Subscribe annually — Whop" : "Subscribe monthly — Whop"}
              </a>
            )}
            {!canCheckout && !hasWhopUrl && (
              <p className="text-sm text-text-muted">Payment options are not configured. Contact support.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Déjà PRO ou Admin : statut actuel, pas d’upgrade
  if (isProOrAdmin) {
    return (
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-text-primary">Pricing</h2>
          <p className="mt-1 text-sm text-text-secondary">
            You are on the PRO plan. Full access is already included.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-semibold text-text-primary">{proPlan?.name ?? "PRO"}</h3>
            <Zap className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <p className="mt-2 text-sm text-text-secondary">Your current plan.</p>
          <Link
            href="/dashboard"
            className="mt-6 block w-full rounded-lg bg-[var(--primary)] py-2 text-center text-sm font-medium text-white hover:opacity-90"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Non connecté : Free + PRO avec onglets Monthly / Annual sur PRO
  const priceYear = (proPlan?.priceYearCents ?? 36000) / 100;
  const priceMonth = (proPlan?.priceMonthCents ?? 4500) / 100;
  const showStripeYear = proPlan?.stripePriceIdYear;
  const showStripeMonth = proPlan?.stripePriceIdMonth;
  const canCheckout = billingInterval === "year" ? showStripeYear : showStripeMonth;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="font-heading text-2xl font-semibold text-text-primary">Pricing</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose the plan that fits your needs. Switch between monthly and annual billing below.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold text-text-primary">{freePlan?.name ?? "Free"}</h3>
          <p className="mt-2 text-2xl font-semibold text-text-primary">
            {(freePlan?.priceYearCents ?? 0) / 100} USD
            <span className="text-sm font-normal text-text-muted"> / year</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Bitcoin, USD, and Stablecoin income planner
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Save 1 scenario
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Basic risk overview
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Yield Board preview
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Limited filters
            </li>
          </ul>
          <Link
            href="/auth/register"
            className="mt-6 block w-full rounded-lg border border-border bg-surface-elevated py-3 text-center text-sm font-medium text-text-primary hover:bg-surface-hover"
          >
            Create free account
          </Link>
        </div>

        <div className="rounded-xl border-2 border-[var(--primary)] bg-surface-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-semibold text-text-primary">{proPlan?.name ?? "PRO"}</h3>
            <Zap className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="mt-4">
            <BillingTabs interval={billingInterval} onIntervalChange={setBillingInterval} />
          </div>
          <div className="mt-4">
            {billingInterval === "year" ? (
              <p className="text-2xl font-semibold text-text-primary">
                {priceYear} USD
                <span className="text-sm font-normal text-text-muted"> / year</span>
              </p>
            ) : (
              <p className="text-2xl font-semibold text-text-primary">
                {priceMonth} USD
                <span className="text-sm font-normal text-text-muted"> / month</span>
              </p>
            )}
            {billingInterval === "year" && (
              <p className="mt-1 text-sm text-text-muted">
                {(priceYear / 12).toFixed(2)} USD per month, billed annually
              </p>
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Unlimited income scenarios
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Full risk intelligence
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Full Yield Board access
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Strategy comparison
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Full instrument details
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              PDF report export
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              Alerts and monitoring
            </li>
          </ul>
          {checkoutError && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400" role="alert">
              {checkoutError}
            </p>
          )}
          {canCheckout && (
            <div className="mt-6">
              <AcceptedCardsStrip />
            </div>
          )}
          <div className="mt-4 flex flex-col gap-3">
            {canCheckout && (
              <button
                type="button"
                disabled={!!checkoutLoading}
                onClick={() => handleStripeCheckout(billingInterval)}
                className="w-full rounded-lg bg-[var(--primary)] py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {checkoutLoading ? "Redirecting…" : billingInterval === "year" ? "Unlock PRO — annual (Stripe)" : "Unlock PRO — monthly (Stripe)"}
              </button>
            )}
            {hasWhopUrl && (
              <a
                href={whopUrlForInterval}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg border border-border py-3 text-center text-sm font-medium text-text-primary hover:bg-surface-hover"
              >
                {billingInterval === "year" ? "Unlock PRO — annual (Whop)" : "Unlock PRO — monthly (Whop)"}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
