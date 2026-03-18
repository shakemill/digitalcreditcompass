"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Request failed");
        return;
      }
      setSent(true);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-dcc.png"
            alt="DCC"
            width={50}
            height={50}
            className="h-[50px] w-auto object-contain"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
          Check your email
        </h1>
        <p className="mt-3 text-center text-sm text-text-secondary">
          If an account exists with that email, we sent a password reset link.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
      <div className="mb-6 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary" aria-hidden>
          <KeyRound className="h-6 w-6" />
        </div>
      </div>
      <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
        Forgot password
      </h1>
      <p className="mt-1 text-center text-sm text-text-secondary">
        Enter your email and we will send a reset link.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="forgot-email" className="mb-1 block text-xs font-medium text-text-secondary">
            Email address
          </label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-text-primary px-3 py-2 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
