import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Acceptable Use Policy",
  description: "Policy defining what users may and may not do with the Digital Credit Compass (DCC) platform and its outputs.",
};

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm sm:p-8 lg:p-10">
          <header className="border-b border-border pb-6">
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Acceptable Use Policy
            </h1>
          </header>

          <div className="prose prose-sm mt-8 max-w-none prose-headings:font-heading prose-headings:font-semibold prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary">
            <div className="mb-8 rounded-lg border border-risk-mid bg-risk-mid-bg px-4 py-3 text-sm">
              <strong className="text-text-primary">IMPORTANT NOTICE — READ BEFORE PROCEEDING</strong>
              <p className="mt-2 text-text-secondary">
                This Acceptable Use Policy defines what Users may and may not do with the Digital Credit Compass (DCC) Platform and its outputs. It forms part of the binding agreement between Users and the Company. Violations may result in immediate termination of access, civil legal action, and referral to relevant regulatory authorities. All Users are required to read and comply with this Policy.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">1. Purpose and Scope</h2>
              <p className="mt-2 text-text-secondary">
                This Acceptable Use Policy (&quot;AUP&quot;) applies to all Users of the DCC Platform, including free-tier users, paid Subscribers, Enterprise Clients, API consumers, and any person or entity accessing Platform outputs directly or through a third-party integration. It supplements the Terms and Conditions and is incorporated by reference therein.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">2. Permitted Uses</h2>
              <p className="mt-2 text-text-secondary">
                The Platform may be used for the following purposes:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-text-secondary">
                <li><strong className="text-text-primary">Personal investment research, education, and due diligence</strong> — accessing scores and outputs to inform your own understanding of digital income products.</li>
                <li><strong className="text-text-primary">Internal institutional analysis</strong> — using DCC outputs within your own organisation for portfolio analysis, risk assessment, or investment committee presentations, provided appropriate disclaimers are maintained.</li>
                <li><strong className="text-text-primary">API integration</strong> — incorporating DCC data into internal workflows and systems under an executed Enterprise API Agreement.</li>
                <li><strong className="text-text-primary">Academic or journalistic research</strong> — referencing DCC outputs with appropriate attribution, clearly identifying DCC as the source and clearly disclaiming that outputs are not investment advice.</li>
                <li><strong className="text-text-primary">Regulatory and compliance documentation</strong> — referencing DCC methodology documentation in internal compliance frameworks, subject to IP restrictions.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">3. Prohibited Uses</h2>
              <div className="mt-4 rounded-lg border border-risk-high bg-risk-high-bg px-4 py-3 text-sm">
                <strong className="text-text-primary">PROHIBITED CONDUCT — ZERO TOLERANCE POLICY</strong>
                <p className="mt-2 text-text-secondary">
                  The following uses are strictly prohibited. Violations will result in immediate account termination and may result in civil proceedings and/or criminal referral. If you are uncertain whether a specific use is permitted, contact{" "}
                  <a href="mailto:support@digitalcreditcompass.com" className="text-[var(--primary)] hover:underline">support@digitalcreditcompass.com</a> before proceeding.
                </p>
              </div>

              <h3 className="mt-6 text-lg font-medium text-text-primary">3.1 Regulatory and Legal Compliance</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Using DCC outputs as the basis for regulated financial promotions, client investment recommendations, or suitability assessments in any jurisdiction without independent legal and regulatory review.</li>
                <li>Representing DCC Scores as credit ratings, regulated assessments, or authorised financial opinions — whether to clients, investors, regulators, or any other party.</li>
                <li>Accessing the Platform from, or on behalf of persons or entities in, jurisdictions subject to applicable sanctions (OFAC, UN, EU, UK OFSI sanctions lists).</li>
                <li>Using the Platform to facilitate money laundering, terrorist financing, proliferation financing, or any other financial crime.</li>
                <li>Submitting false identity information during registration, KYB, or enterprise onboarding.</li>
              </ul>

              <h3 className="mt-6 text-lg font-medium text-text-primary">3.2 Intellectual Property</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Scraping, bulk-downloading, or systematically copying DCC data, scores, or outputs beyond permitted API quotas — whether manually or using automated tools, bots, or crawlers.</li>
                <li>Reverse-engineering, decompiling, or attempting to derive the scoring algorithm or methodology beyond what is published in the DCC Risk Scoring Methodology document.</li>
                <li>Distributing, reselling, sublicensing, or white-labelling DCC outputs in any commercial product or service without written authorisation from the Company.</li>
                <li>Using DCC outputs in any publication, marketing material, or client communication in a manner that implies endorsement by the Company or misrepresents the nature of DCC outputs.</li>
              </ul>

              <h3 className="mt-6 text-lg font-medium text-text-primary">3.3 Platform Integrity</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Sharing login credentials with unauthorised users or enabling concurrent multi-user access on single-user subscription tiers.</li>
                <li>Interfering with the Platform&apos;s technical infrastructure, security systems, databases, or data integrity — including denial-of-service attacks, injection attacks, or any other form of technical abuse.</li>
                <li>Introducing malicious code, viruses, or harmful content into the Platform or its APIs.</li>
                <li>Attempting to gain unauthorised access to accounts, data, or systems that belong to other Users or the Company.</li>
              </ul>

              <h3 className="mt-6 text-lg font-medium text-text-primary">3.4 Market Conduct</h3>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Using the Platform in connection with market manipulation, wash trading, front-running, or any other unlawful market practice.</li>
                <li>Using DCC outputs to create artificial urgency or false market signals in communications with investors or counterparties.</li>
                <li>Distributing DCC outputs in a manner that omits material disclaimers required by these Terms or applicable regulatory requirements.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">4. Enterprise API — Additional Rules</h2>
              <p className="mt-2 text-text-secondary">
                Enterprise API users are additionally prohibited from:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Exceeding agreed API rate limits or quota allocations, or circumventing rate limiting mechanisms.</li>
                <li>Storing DCC scores in external databases for the purpose of redistribution, except as expressly authorised in the Enterprise Services Agreement.</li>
                <li>Using the API to power a competing analytical service or to train machine learning models without express written authorisation.</li>
                <li>Passing DCC API credentials to third parties outside the Enterprise Client&apos;s organisation.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">5. Enforcement</h2>
              <p className="mt-2 text-text-secondary">
                The Company reserves the right to:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-text-secondary">
                <li>Immediately suspend or terminate access for any actual or suspected violation of this AUP.</li>
                <li>Investigate suspected violations, including reviewing access logs, API call patterns, and usage data.</li>
                <li>Cooperate fully with law enforcement, regulatory authorities, and legal process in connection with AUP violations.</li>
                <li>Pursue civil remedies, including injunctive relief, damages, and recovery of legal costs, for material violations.</li>
                <li>Report violations to relevant regulatory authorities, including financial regulators, where appropriate.</li>
              </ul>
              <p className="mt-4 text-text-secondary">
                Enforcement actions are at the Company&apos;s sole discretion. The Company is not obligated to issue warnings before taking enforcement action in respect of serious or wilful violations.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">6. Reporting Violations</h2>
              <p className="mt-2 text-text-secondary">
                If you become aware of any violation of this AUP by another User, or if you discover a security vulnerability in the Platform, please report it immediately to:{" "}
                <a href="mailto:support@digitalcreditcompass.com" className="text-[var(--primary)] hover:underline">support@digitalcreditcompass.com</a>
              </p>
              <p className="mt-3 text-text-secondary">
                The Company treats all reports confidentially and will not disclose the identity of a reporter without consent, except where required by law.
              </p>
            </section>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
