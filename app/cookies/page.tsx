import type { Metadata } from "next";
import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Digital Credit Compass (DCC) uses cookies and similar tracking technologies.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl border border-border bg-surface-card p-6 shadow-sm sm:p-8 lg:p-10">
          <header className="border-b border-border pb-6">
            <h1 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
              Cookie Policy
            </h1>
            <p className="mt-2 text-lg text-text-secondary">
              How Digital Credit Compass (DCC) Uses Cookies and Similar Tracking Technologies
            </p>
          </header>

          <div className="prose prose-sm mt-8 max-w-none prose-headings:font-heading prose-headings:font-semibold prose-headings:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary prose-strong:text-text-primary">
            <div className="mb-8 rounded-lg border border-risk-mid bg-risk-mid-bg px-4 py-3 text-sm">
              <strong className="text-text-primary">IMPORTANT NOTICE — READ BEFORE PROCEEDING</strong>
              <p className="mt-2 text-text-secondary">
                This Cookie Policy explains what cookies and similar tracking technologies DCC uses, why we use them, and how you can control them. It forms part of our Privacy Policy and applies to all visitors to the DCC website and Platform. Your use of the Platform following acceptance of the cookie consent banner constitutes consent to cookie placement as described in this Policy.
              </p>
            </div>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">1. What Are Cookies?</h2>
              <p className="mt-2 text-text-secondary">
                Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a website. They are widely used to make websites work more efficiently, to provide a better user experience, and to give website operators analytical information about how their sites are used.
              </p>
              <p className="mt-3 text-text-secondary">
                Similar technologies include web beacons (pixel tags), local storage, and session storage. This Policy applies to all such technologies, which are referred to collectively as &apos;cookies&apos; for simplicity.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">2. How We Use Cookies</h2>
              <p className="mt-2 text-text-secondary">
                DCC uses cookies for the following purposes:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-6 text-text-secondary">
                <li>To keep you securely logged in during your session.</li>
                <li>To remember your preferences and settings (such as language, time zone, and dashboard layout).</li>
                <li>To understand how the Platform is used so we can improve it.</li>
                <li>To ensure the security and integrity of your account and our systems.</li>
              </ul>
              <div className="mt-4 rounded-lg border border-border bg-surface-elevated px-4 py-3 text-sm">
                <strong className="text-text-primary">NO ADVERTISING COOKIES</strong>
                <p className="mt-2 text-text-secondary">
                  We do <strong>NOT</strong> use cookies for targeted advertising. DCC does not serve advertising and does not permit third-party advertising trackers on the Platform.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">3. Cookie Categories</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Category</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Description and Legal Basis</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Specific Cookies / Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr>
                      <td className="border border-border px-4 py-2">Strictly Necessary</td>
                      <td className="border border-border px-4 py-2">Essential for the Platform to function. Cannot be disabled. Legal basis: necessary for the performance of a contract / legitimate interests (security).</td>
                      <td className="border border-border px-4 py-2">Session ID, CSRF token, authentication state, load balancer routing. Set by DCC only. Session or short-lived duration.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Functional</td>
                      <td className="border border-border px-4 py-2">Enable personalised features and remember preferences. Set only with consent (except where essential to a function you have explicitly requested).</td>
                      <td className="border border-border px-4 py-2">Language preference, dashboard layout, time zone, notification settings. Set by DCC. Duration: up to 12 months.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Analytics</td>
                      <td className="border border-border px-4 py-2">Help us understand how Users interact with the Platform. Data is anonymised before storage. Legal basis: consent.</td>
                      <td className="border border-border px-4 py-2">Page views, feature engagement, session duration, error events, funnel analysis. Analytics provider subject to DPA. Duration: up to 13 months.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">Marketing</td>
                      <td className="border border-border px-4 py-2">DCC does NOT currently use marketing or advertising cookies. Listed here for transparency only. Renewed consent will be sought before any such cookies are placed.</td>
                      <td className="border border-border px-4 py-2">None currently in use.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">4. Specific Cookies We Use</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Cookie Name</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Category</th>
                      <th className="border border-border px-4 py-2 text-left font-semibold text-text-primary">Purpose and Duration</th>
                    </tr>
                  </thead>
                  <tbody className="text-text-secondary">
                    <tr>
                      <td className="border border-border px-4 py-2">dcc_session</td>
                      <td className="border border-border px-4 py-2">Strictly Necessary</td>
                      <td className="border border-border px-4 py-2">Session authentication — keeps you securely logged in. Deleted at session end.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">dcc_csrf</td>
                      <td className="border border-border px-4 py-2">Strictly Necessary</td>
                      <td className="border border-border px-4 py-2">Cross-site request forgery protection. Deleted at session end.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">dcc_prefs</td>
                      <td className="border border-border px-4 py-2">Functional</td>
                      <td className="border border-border px-4 py-2">Stores user preferences (language, layout, time zone). Duration: 12 months.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">dcc_analytics</td>
                      <td className="border border-border px-4 py-2">Analytics</td>
                      <td className="border border-border px-4 py-2">Anonymous usage tracking. Pseudonymised user identifier. Duration: 13 months. Requires consent.</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-4 py-2">dcc_consent</td>
                      <td className="border border-border px-4 py-2">Strictly Necessary</td>
                      <td className="border border-border px-4 py-2">Records your cookie consent preferences. Duration: 12 months.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-text-secondary">
                This table reflects cookies in use as of the Effective Date. An up-to-date full cookie declaration is maintained on our website and is updated within 30 days of any change.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">5. Third-Party Cookies</h2>
              <p className="mt-2 text-text-secondary">
                Where we use third-party analytics providers, those providers may set their own cookies subject to their own privacy policies. We conduct data processing agreement reviews for all analytics sub-processors and require data minimisation and anonymisation as standard contractual terms.
              </p>
              <p className="mt-3 text-text-secondary">
                We do <strong>NOT</strong> permit third-party social media trackers, advertising networks, or data brokers to place cookies on the Platform.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">6. Managing Your Cookie Preferences</h2>

              <h3 className="mt-4 text-lg font-medium text-text-primary">6.1 Cookie Consent Banner</h3>
              <p className="mt-2 text-text-secondary">
                On your first visit to the Platform, you will be presented with a cookie consent banner. You can: (a) Accept all cookies; (b) Accept only strictly necessary cookies; or (c) Customise your preferences by category. Your choice is saved in the &apos;dcc_consent&apos; cookie and applied to all subsequent visits until you change your preferences.
              </p>

              <h3 className="mt-4 text-lg font-medium text-text-primary">6.2 Changing Your Preferences</h3>
              <p className="mt-2 text-text-secondary">
                You can update your cookie preferences at any time by clicking the &apos;Cookie Preferences&apos; link in the Platform footer. This will reopen the consent banner and allow you to change your selections.
              </p>

              <h3 className="mt-4 text-lg font-medium text-text-primary">6.3 Browser Controls</h3>
              <p className="mt-2 text-text-secondary">
                Most browsers allow you to control cookies through their settings, including: blocking all cookies; blocking third-party cookies only; deleting cookies on browser close; and viewing and deleting specific cookies. Note that disabling strictly necessary cookies will prevent the Platform from functioning correctly. Browser-specific instructions are available at{" "}
                <a href="https://www.aboutcookies.org" className="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a>.
              </p>

              <h3 className="mt-4 text-lg font-medium text-text-primary">6.4 Opt-Out of Analytics</h3>
              <p className="mt-2 text-text-secondary">
                To opt out of analytics cookies at any time, use the Cookie Preferences panel in the Platform footer. Opting out will not affect your ability to use any Platform features.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">7. Do Not Track</h2>
              <p className="mt-2 text-text-secondary">
                Some browsers transmit a &apos;Do Not Track&apos; (DNT) signal. The Platform currently recognises DNT signals and, where a DNT signal is detected, only strictly necessary cookies will be placed pending your explicit consent through the cookie consent banner.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">8. Updates to This Policy</h2>
              <p className="mt-2 text-text-secondary">
                We may update this Cookie Policy from time to time to reflect changes to the cookies we use, regulatory requirements, or our business practices. When we make material changes, we will update the Effective Date at the top of this Policy and, where required by applicable law, seek renewed consent. The current version is always available on our website.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-text-primary">9. Contact</h2>
              <p className="mt-2 text-text-secondary">
                If you have any questions about this Cookie Policy or our use of cookies, please contact our Privacy team at{" "}
                <a href="mailto:support@digitalcreditcompass.com" className="text-[var(--primary)] hover:underline">support@digitalcreditcompass.com</a>.
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
