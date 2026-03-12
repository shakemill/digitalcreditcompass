"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "1") setVerified(true);
    const err = searchParams.get("error");
    if (err === "invalid_or_expired") setError("Verification link invalid or expired.");
    else if (err === "link_expired") setError("This verification link has expired. Please register again or request a new link.");
    else if (err === "missing_token") setError("Missing verification token.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Sign in failed");
        return;
      }
      const role = data.user?.role;
      if (role === "SUPER_ADMIN") router.replace("/admin");
      else if (role === "PRO") router.replace("/dashboard/pro");
      else router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
      <div className="mb-6 flex justify-center">
        <img
          src="/logo-dcc.png"
          alt="DCC"
          width={120}
          height={44}
          className="h-12 w-auto object-contain"
        />
      </div>
      <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
        Sign in
      </h1>
      <p className="mt-1 text-center text-sm text-text-secondary">
        Sign in to your DCC account.
      </p>
      {verified && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-center text-sm text-green-800" role="status">
          Email verified. You can sign in now.
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-xs font-medium text-text-secondary">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-medium text-text-secondary">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-[var(--primary)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-medium text-[var(--primary)] hover:underline">
          Create free account
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-sm font-medium text-text-secondary hover:text-text-primary hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm"><p className="text-center text-text-muted">Loading…</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
