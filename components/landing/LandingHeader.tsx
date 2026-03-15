"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, ArrowRight, Download } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/", sectionId: null },
  { label: "Features", href: "/#how-it-works", sectionId: "how-it-works" },
  { label: "Pricing", href: "/#pricing", sectionId: "pricing" },
  { label: "Understanding DCC", href: "/#faq", sectionId: "faq" },
  { label: "Contact", href: "/#contact", sectionId: "contact" },
];

const RISK_METHODOLOGY_HREF = "/api/download-risk-methodology";

const SECTION_IDS = ["how-it-works", "pricing", "faq", "cta", "contact"];

function getActiveSection(): string | null {
  if (typeof document === "undefined") return null;
  const topOffset = 120;
  let active: string | null = null;
  let maxTop = -Infinity;
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= topOffset && rect.bottom > 0 && rect.top > maxTop) {
      maxTop = rect.top;
      active = id;
    }
  }
  return active;
}

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string | null; email: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.user) return;
        setUser({
          name: data.user.name ?? null,
          email: data.user.email ?? "",
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    function update() {
      setActiveSection(getActiveSection());
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const linkClass = (sectionId: string | null) => {
    const isActive =
      (sectionId === null && activeSection === null && pathname === "/") ||
      (sectionId === "contact" && (pathname === "/contact" || activeSection === "contact" || activeSection === "cta")) ||
      (sectionId !== null && sectionId !== "contact" && activeSection === sectionId);
    return `text-sm font-medium transition-colors ${
      isActive ? "text-[var(--primary)]" : "text-text-secondary hover:text-text-primary"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center transition-opacity hover:opacity-80"
          aria-label="Digital Credit Compass Home"
        >
          <img
            src="/logo-dcc.png"
            alt="DCC"
            width={48}
            height={48}
            className="h-12 w-auto object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ label, href, sectionId }) => (
            <Link key={`${href}-${label}`} href={href} className={linkClass(sectionId)}>
              {label}
            </Link>
          ))}
          <Link
            href={RISK_METHODOLOGY_HREF}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover hover:text-text-secondary"
          >
            <Download className="h-4 w-4 shrink-0" aria-hidden />
            Risk methodology
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            {user ? (
              <>
                <span className="text-sm font-medium text-text-primary max-w-[180px] truncate" title={user.email}>
                  {user.name?.trim() || user.email}
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-card hover:text-text-secondary"
                >
                  <LogIn className="h-4 w-4 shrink-0" aria-hidden />
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-text-primary md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="border-t border-border bg-surface-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile">
            {NAV_LINKS.map(({ label, href, sectionId }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-hover ${
                  (sectionId === null && activeSection === null && pathname === "/") ||
                  (sectionId === "contact" && (pathname === "/contact" || activeSection === "contact" || activeSection === "cta")) ||
                  (sectionId !== null && sectionId !== "contact" && activeSection === sectionId)
                    ? "text-[var(--primary)]"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href={RISK_METHODOLOGY_HREF}
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
              Risk methodology
            </Link>
            {user && (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <p className="truncate px-3 text-sm font-medium text-text-primary" title={user.email}>
                  {user.name?.trim() || user.email}
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
