"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
    else setError("Missing reset token.");
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Update failed");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.replace("/auth/login"), 2000);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo-dcc.png"
            alt="DCC"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
            unoptimized
          />
        </div>
        <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
          Password updated
        </h1>
        <p className="mt-3 text-center text-sm text-text-secondary">
          Redirecting to sign in…
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  if (!token && !error) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        <p className="text-center text-sm text-text-secondary">Loading…</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        <p className="text-center text-sm text-red-600">{error}</p>
        <p className="mt-4 text-center text-sm">
          <Link href="/auth/forgot-password" className="font-medium text-[var(--primary)] hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo-dcc.png"
          alt="DCC"
          width={48}
          height={48}
          className="h-12 w-12 object-contain"
          priority
        />
      </div>
      <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
        Set new password
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="reset-password" className="mb-1 block text-xs font-medium text-text-secondary">
            New password
          </label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="reset-confirm" className="mb-1 block text-xs font-medium text-text-secondary">
            Confirm password
          </label>
          <input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            minLength={8}
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
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm"><p className="text-center text-text-muted">Loading…</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
