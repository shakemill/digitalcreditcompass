import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Digital Credit Compass (DCC) collects, uses, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm sm:p-8 lg:p-10">
          <header className="border-b border-border pb-6">
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-2 text-lg text-text-secondary">
              How Digital Credit Compass (DCC) Collects, Uses, and Protects Personal Data
            </p>
          </header>

          <div className="prose prose-sm mt-8 max-w-none prose-headings:font-heading prose-headings:font-semibold prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary">
            <div className="mb-8 rounded-lg border border-risk-mid bg-risk-mid-bg px-4 py-3 text-sm">
              <strong className="text-text-primary">IMPORTANT NOTICE — READ BEFORE PROCEEDING</strong>
              <p className="mt-2 text-text-secondary">
                This Privacy Policy explains how DCC collects, uses, stores, shares, and protects your personal data, and how you can exercise your data subject rights. It applies to all data collected through the Platform, website, API, and any communications with the Company. DCC acts as a data controller in respect of personal data processed directly in connection with user accounts and platform access.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">1. Personal Data We Collect</h2>
              <p className="mt-2 text-text-secondary">
                We collect the following categories of personal data:
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Category</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Data Items</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr>
                      <td className="border border-border px-4 py-2">Account Data</td>
                      <td className="border border-border px-4 py-2">Full name, email, username, password (hashed), preferences, time zone, language.</td>
                      <td className="border border-border px-4 py-2">Account registration and management</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Identity / KYB Data</td>
                      <td className="border border-border px-4 py-2">Enterprise Clients: legal entity name, registered address, beneficial ownership, director names, corporate documents, regulatory status, sanctions screening results.</td>
                      <td className="border border-border px-4 py-2">Enterprise onboarding, AML/KYB compliance</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Subscription &amp; Billing</td>
                      <td className="border border-border px-4 py-2">Subscription tier, billing address, invoice records, payment method type (card last 4 digits only — full card data processed by PCI-DSS processor, never stored by DCC).</td>
                      <td className="border border-border px-4 py-2">Subscription management and billing</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Usage Data</td>
                      <td className="border border-border px-4 py-2">IP address, browser type, OS, pages visited, features used, session duration, API call logs, error logs.</td>
                      <td className="border border-border px-4 py-2">Service delivery, security, platform improvement</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Communication Data</td>
                      <td className="border border-border px-4 py-2">Email content, support ticket content, survey responses, and any data voluntarily submitted in communications.</td>
                      <td className="border border-border px-4 py-2">Support and service improvement</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Compliance Data</td>
                      <td className="border border-border px-4 py-2">Jurisdiction of residence, self-declared investor type, risk profile, and regulatory acknowledgements made on the Platform.</td>
                      <td className="border border-border px-4 py-2">Regulatory compliance and appropriate use verification</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-text-secondary">
                We do <strong>NOT</strong> collect biometric data, government ID numbers (except for specific enterprise KYB), or special category personal data unless explicitly required for a compliance purpose and separately consented to.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">2. Legal Bases for Processing</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Legal Basis</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Processing Activities</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr><td className="border border-border px-4 py-2">Contract Performance</td><td className="border border-border px-4 py-2">Processing necessary to deliver subscribed Services, manage accounts, provide support, and execute billing.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Legitimate Interests</td><td className="border border-border px-4 py-2">Usage analytics to improve the Platform, security monitoring, fraud prevention, marketing to existing Users (with opt-out), and enforcement of Terms.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Legal Obligation</td><td className="border border-border px-4 py-2">AML/KYB screening for Enterprise Clients, sanctions compliance, tax records retention, and regulatory reporting obligations.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Consent</td><td className="border border-border px-4 py-2">Marketing to prospective Users where required by law; non-essential cookie placement (see Cookie Policy); research participation.</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">3. Data Sharing and Third Parties</h2>
              <p className="mt-2 text-text-secondary">
                Personal data is shared with third parties only in the following circumstances:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-text-secondary">
                <li><strong className="text-text-primary">Service Providers:</strong> Cloud hosting, payment processors, email delivery, analytics platforms, and KYB/AML providers — each under strict data processing agreements and confidentiality obligations.</li>
                <li><strong className="text-text-primary">Enterprise Integrations:</strong> Where an Enterprise Client requires specific third-party data sharing under an agreed integration, pursuant to a Data Processing Addendum.</li>
                <li><strong className="text-text-primary">Legal Requirements:</strong> Where disclosure is required by law, court order, or regulatory authority — subject to the Company challenging such requests where legally permitted.</li>
                <li><strong className="text-text-primary">Business Transfers:</strong> In connection with a merger, acquisition, or asset sale — subject to the acquiring entity being bound by equivalent data protection obligations.</li>
                <li><strong className="text-text-primary">Aggregated Analytics:</strong> Non-identifiable, aggregated usage statistics may be shared for industry research.</li>
              </ul>
              <div className="mt-4 rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm">
                <strong className="text-text-primary">DATA NOT SOLD</strong>
                <p className="mt-2 text-text-secondary">
                  DCC does <strong>NOT</strong> sell personal data to third parties. DCC does <strong>NOT</strong> permit third-party advertising tracking on the Platform.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">4. International Data Transfers</h2>
              <p className="mt-2 text-text-secondary">
                The Company operates primarily from the UAE and may process data on servers in the EU, UK, or US. International transfers are conducted under: EU/EEA Standard Contractual Clauses (SCCs); UK International Data Transfer Agreements (IDTAs) or SCCs with UK Addendum; DIFC mechanisms compliant with DIFC Data Protection Law 2020; and adequacy decisions where applicable. To request a copy of the applicable transfer mechanism, contact{" "}
                <a href="mailto:support@digitalcreditcompass.com" className="text-[var(--primary)] hover:underline">support@digitalcreditcompass.com</a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">5. Data Security</h2>
              <p className="mt-2 text-text-secondary">
                We implement appropriate technical and organisational security measures including:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-text-secondary">
                <li>Encryption of personal data in transit (TLS 1.2+) and at rest (AES-256).</li>
                <li>Access controls with role-based permissions and multi-factor authentication for internal systems.</li>
                <li>Regular security vulnerability assessments and penetration testing.</li>
                <li>Vendor security due diligence for all sub-processors.</li>
                <li>Incident response procedures with defined escalation protocols and employee training on data protection.</li>
              </ul>
              <p className="mt-4 text-text-secondary">
                In the event of a personal data breach likely to result in high risk to individuals&apos; rights, we will notify affected Users and relevant supervisory authorities within the timescales required by Applicable Law (typically 72 hours under GDPR/UK GDPR).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">6. Data Retention</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Data Category</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr><td className="border border-border px-4 py-2">Account data</td><td className="border border-border px-4 py-2">Duration of active account + 7 years</td></tr>
                    <tr><td className="border border-border px-4 py-2">KYB / AML records</td><td className="border border-border px-4 py-2">5 years from end of business relationship (or longer if required by applicable AML law)</td></tr>
                    <tr><td className="border border-border px-4 py-2">Transaction / billing records</td><td className="border border-border px-4 py-2">7 years (tax and financial record-keeping)</td></tr>
                    <tr><td className="border border-border px-4 py-2">Usage logs</td><td className="border border-border px-4 py-2">13 months (security and analytics)</td></tr>
                    <tr><td className="border border-border px-4 py-2">Support communications</td><td className="border border-border px-4 py-2">3 years from last interaction</td></tr>
                    <tr><td className="border border-border px-4 py-2">Marketing consent records</td><td className="border border-border px-4 py-2">Until consent withdrawn + 3 years</td></tr>
                    <tr><td className="border border-border px-4 py-2">Anonymised / aggregated data</td><td className="border border-border px-4 py-2">Indefinitely (no personal data identifiable)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-text-secondary">
                Following the applicable retention period, data is securely deleted or anonymised. You may request earlier deletion subject to the Company&apos;s legal retention obligations.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">7. Your Rights</h2>
              <p className="mt-2 text-text-secondary">
                Depending on applicable law, you may have the following rights:
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Right</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Description</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr><td className="border border-border px-4 py-2">Access</td><td className="border border-border px-4 py-2">Obtain a copy of personal data we hold about you (Data Subject Access Request).</td></tr>
                    <tr><td className="border border-border px-4 py-2">Rectification</td><td className="border border-border px-4 py-2">Require correction of inaccurate or incomplete personal data.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Erasure</td><td className="border border-border px-4 py-2">Request deletion of personal data where no longer necessary, or where processing was based on withdrawn consent.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Restriction</td><td className="border border-border px-4 py-2">Request that processing be restricted in certain circumstances (e.g., while accuracy is contested).</td></tr>
                    <tr><td className="border border-border px-4 py-2">Data Portability</td><td className="border border-border px-4 py-2">Receive personal data in a structured, machine-readable format.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Objection</td><td className="border border-border px-4 py-2">Object to processing based on legitimate interests, including direct marketing.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Withdrawal of Consent</td><td className="border border-border px-4 py-2">Withdraw consent at any time without affecting the lawfulness of prior processing.</td></tr>
                    <tr><td className="border border-border px-4 py-2">Complaints</td><td className="border border-border px-4 py-2">Lodge a complaint with the relevant supervisory authority (e.g., ICO — UK, CNIL — France, PDPC — Singapore, DIFC Commissioner — DIFC, UAE TDRA — UAE).</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-text-secondary">
                To exercise any of these rights, submit a request to{" "}
                <a href="mailto:support@digitalcreditcompass.com" className="text-[var(--primary)] hover:underline">support@digitalcreditcompass.com</a> with sufficient information to verify your identity. We will respond within 30 days (extendable by 60 days for complex requests, with notice).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">8. Data Processing Addendum</h2>
              <p className="mt-2 text-text-secondary">
                Enterprise Clients who act as data controllers in respect of their end users&apos; personal data processed through the DCC API or integrated workflows may require a Data Processing Addendum (DPA). The DPA documents the parties&apos; respective roles and obligations under GDPR, UK GDPR, and equivalent frameworks, and specifies processing purposes, data categories, sub-processor lists, security measures, audit rights, and data subject rights procedures. DPAs are available upon request and form part of the Enterprise Services Agreement.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">9. Cookies</h2>
              <p className="mt-2 text-text-secondary">
                The Platform uses cookies and similar tracking technologies. For full details on cookie categories, purposes, and how to manage your preferences, please refer to the separate Cookie Policy at{" "}
                <a href="https://digitalcreditcompass.com/cookies" className="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer">digitalcreditcompass.com/cookies</a>.
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
