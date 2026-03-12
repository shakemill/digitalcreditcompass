"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Home } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Failed to send message.");
        return;
      }
      setSent(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base">
      <LandingHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <h1 className="font-heading text-[45px] font-bold leading-tight text-text-primary">
            Contact <span className="text-[var(--primary)]">Us</span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Send us a message and we&apos;ll get back to you as soon as we can.
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-xl border border-border bg-white p-8 shadow-sm">
            <div className="rounded-lg border border-risk-low bg-risk-low-bg p-6 text-center">
              <p className="font-medium text-risk-low">Message sent successfully.</p>
              <p className="mt-1 text-sm text-text-secondary">
                We&apos;ll reply to your email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                Send another message
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-border bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="rounded-lg bg-risk-high-bg px-4 py-2 text-sm text-risk-high" role="alert">
                {error}
              </p>
            )}
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-text-primary">
                Name *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-text-primary">
                Email *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-text-primary">
                Subject *
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="What is this about?"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-text-primary">
                Message *
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded-lg border border-border bg-white px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Your message..."
              />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Send className="h-5 w-5 shrink-0" aria-hidden />
                {loading ? "Sending..." : "Send message"}
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-text-primary transition-colors hover:bg-surface-hover"
              >
                <Home className="h-5 w-5 shrink-0" aria-hidden />
                Back to home
              </Link>
            </div>
          </form>
          </div>
        )}
      </main>
      <LandingFooter />
    </div>
  );
}
