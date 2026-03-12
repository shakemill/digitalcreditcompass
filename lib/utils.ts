import type { NextRequest } from "next/server";

/**
 * Base URL for redirects and emails. Prefers env, then proxy headers (X-Forwarded-*), then request URL.
 * Use in API routes when redirecting so production behind a proxy does not redirect to localhost.
 */
export function getBaseUrlFromRequest(req: NextRequest): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "").trim();
  if (fromEnv) return fromEnv;

  const proto = req.headers.get("x-forwarded-proto") || (req.nextUrl?.protocol?.replace(":", "") ?? "https");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || req.nextUrl?.host ?? "localhost";
  return `${proto}://${host}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatScore(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
