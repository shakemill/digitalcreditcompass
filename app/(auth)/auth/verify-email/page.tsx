"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { method: "GET" })
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
          return;
        }
        setStatus(res.ok ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm">
        <p className="text-center text-sm text-text-secondary">Verifying your email…</p>
      </div>
    );
  }

  if (status === "error") {
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
          Verification failed
        </h1>
        <p className="mt-3 text-center text-sm text-text-secondary">
          The link may be invalid or expired.
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
      <p className="text-center text-sm text-text-secondary">Redirecting…</p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm rounded-xl border border-border bg-surface-card p-8 shadow-sm"><p className="text-center text-text-muted">Loading…</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
