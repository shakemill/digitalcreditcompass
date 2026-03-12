import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingFAQ } from "@/components/landing/LandingFAQ";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { getComingSoonEnabled } from "@/lib/site-settings";
import { getSessionFromCookie } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Digital Credit Compass | Clarity Before Yield — Bitcoin & Stablecoin Income Planning",
  description:
    "Plan Bitcoin-backed and stablecoin income with transparent risk. Digital Credit Compass (DCC) lets you simulate yield, stress-test scenarios, compare strategies, and generate reports—without selling your Bitcoin.",
  keywords: [
    "Bitcoin yield planning",
    "stablecoin income",
    "digital credit compass",
    "Clarity Before Yield",
    "yield intelligence",
    "risk analysis",
    "income scenarios",
    "crypto lending",
  ],
  openGraph: {
    title: "Digital Credit Compass | Clarity Before Yield",
    description:
      "Plan Bitcoin-backed and stablecoin income with transparent risk. Simulate, compare, and report—without selling your Bitcoin.",
  },
};

export default async function HomePage() {
  const comingSoonEnabled = await getComingSoonEnabled();
  if (comingSoonEnabled) {
    const session = await getSessionFromCookie();
    const isSuperAdmin = session?.role === "SUPER_ADMIN";
    if (!isSuperAdmin) {
      redirect("/coming-soon");
    }
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main>
        <ScrollReveal delay={0}>
          <LandingHero />
        </ScrollReveal>
        <ScrollReveal delay={50}>
          <HowItWorks />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <LandingPricing />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <LandingFAQ />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <LandingCTA />
        </ScrollReveal>
        <LandingFooter />
      </main>
    </div>
  );
}
