"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export function DataUnderReviewBanner() {
  const [stale, setStale] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/market-data/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setStale(!!data?.stale))
      .catch(() => setStale(false));
  }, []);

  if (stale !== true) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm font-medium">Data Under Review</p>
      <p className="text-sm text-amber-800">
        Market data is older than 7 days or marked stale. Scores may not reflect the latest market conditions.
      </p>
    </div>
  );
}
