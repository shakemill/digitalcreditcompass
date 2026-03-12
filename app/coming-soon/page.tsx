import Link from "next/link";

export const metadata = {
  title: "Coming Soon | Digital Credit Compass",
  description: "We're preparing something great. Digital Credit Compass is coming soon.",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-4">
      <Link href="/" className="mb-8 flex items-center transition-opacity hover:opacity-80" aria-label="Digital Credit Compass">
        <img src="/logo-dcc.png" alt="DCC" width={160} height={160} className="h-32 w-32 sm:h-40 sm:w-40 object-contain" />
      </Link>
      <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl text-center">
        Coming Soon
      </h1>
      <p className="mt-4 max-w-md text-center text-text-secondary">
        We&apos;re preparing something great. Digital Credit Compass will help you model Bitcoin-backed, fiat, and stablecoin income with transparent risk scoring.
      </p>
      <p className="mt-8 text-sm text-text-muted">
        <Link href="/contact" className="font-medium text-[var(--primary)] hover:underline">
          Get in touch
        </Link>
      </p>
    </div>
  );
}
