"use client";

import { ToggleGroup } from "@/components/ui/ToggleGroup";

const durations: { value: string; label: string }[] = [
  { value: "1", label: "1 an" },
  { value: "3", label: "3 ans" },
  { value: "5", label: "5 ans" },
  { value: "7", label: "7 ans" },
];

export function DurationMultiplierCard({
  durationYears,
  onDurationChange,
}: {
  durationYears?: number;
  onDurationChange: (years: number) => void;
}) {
  const value = durationYears != null ? String(durationYears) : "1";

  return (
    <div className="rounded-lg border border-border bg-surface-card p-4">
      <p className="mb-2 text-sm font-medium text-text-primary">Duration / multiplier</p>
      <ToggleGroup
        value={value}
        options={durations}
        onChange={(v) => onDurationChange(Number(v))}
        ariaLabel="Duration in years"
      />
    </div>
  );
}
