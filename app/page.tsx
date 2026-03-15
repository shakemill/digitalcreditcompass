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
import { getComingSoonEnabled, getLandingSEOSettings } from "@/lib/site-settings";
import { getSessionFromCookie } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getLandingSEOSettings();
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
    twitter: {
      title: seo.ogTitle,
      description: seo.ogDescription,
    },
  };
}

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
