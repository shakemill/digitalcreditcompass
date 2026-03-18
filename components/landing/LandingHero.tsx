import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function LandingHero() {
  return (
    <section className="bg-surface-base px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex rounded-full bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white">
          Independent Risk Analysis Platform
        </div>
        <h1 className="font-heading text-3xl font-bold leading-tight text-text-primary sm:text-4xl lg:text-5xl">
          Clarity Before Capital—Model Digital Income with{" "}
          <span className="text-[var(--primary)]">Transparent Risk</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base text-text-secondary sm:text-lg">
          Digital Credit Compass (DCC) is an independent planning and analysis platform that enables users to simulate and compare Bitcoin-backed, fiat, and stablecoin income structures using standardized risk scoring, scenario modeling, and risk analysis ready reports — without custody of assets and without execution of transactions.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="inline-flex h-[46px] items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            Start Planning Now!
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </Link>
          <Link
            href="/#how-it-works"
            className="inline-flex h-[46px] items-center gap-2 rounded-lg border-2 border-text-primary bg-white px-6 py-3 text-base font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <Play className="h-5 w-5 shrink-0" aria-hidden />
            See DCC in Action
          </Link>
        </div>
      </div>
    </section>
  );
}
