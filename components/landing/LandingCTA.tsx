import Link from "next/link";
import { Rocket, Mail } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="bg-surface-base px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl p-10 text-center sm:p-12">
        <h2 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
          Ready to Get <span className="text-[var(--primary)]">Started?</span>
        </h2>
        <p className="mt-4 text-text-secondary">
          Start exploring income strategies and building resilient portfolios. No credit card required.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
          >
            <Rocket className="h-5 w-5 shrink-0" aria-hidden />
            Start A Free Plan
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-text-primary transition-colors hover:bg-surface-hover"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden />
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
