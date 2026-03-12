"use client";

import { Check, AlertTriangle } from "lucide-react";

export function RehypoBadge({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
        <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden />
        Yes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      <Check className="h-3 w-3 shrink-0" aria-hidden />
      No
    </span>
  );
}
