"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | Record<string, string[]>>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!agree) {
      setError("You must agree to the Terms and Conditions and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? (typeof data?.error === "object" ? data.error : "Registration failed."));
        return;
      }
      setSuccess(true);
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary" aria-hidden>
            <UserPlus className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
          Check your email
        </h1>
        <p className="mt-3 text-center text-sm text-text-secondary">
          We sent an activation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
        <p className="mt-4 text-center text-sm text-text-secondary">
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
          <UserPlus className="h-6 w-6" />
        </div>
      </div>
      <h1 className="text-center font-heading text-lg font-semibold text-text-primary">
        Create account
      </h1>
      <p className="mt-1 text-center text-sm text-text-secondary">
        Sign up for a free DCC account.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="reg-name" className="mb-1 block text-xs font-medium text-text-secondary">
            Full name
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-1 block text-xs font-medium text-text-secondary">
            Email
          </label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password" className="mb-1 block text-xs font-medium text-text-secondary">
            Password
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-muted hover:text-text-primary"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <input
            id="reg-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-border text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <label htmlFor="reg-agree" className="text-xs text-text-secondary">
            I agree to the{" "}
            <Link href="/terms" className="text-[var(--primary)] hover:underline">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[var(--primary)] hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {typeof error === "string"
              ? error
              : Object.values(error).flat().join(" ")}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-text-primary px-3 py-2 text-sm font-medium text-surface-card hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
