"use client";

import { useFiatPlanner } from "@/hooks/useFiatPlanner";
import { FormField } from "@/components/ui/FormField";
import { ResultCell } from "@/components/ui/ResultCell";

export function FiatPlannerForm() {
  const { state, setField, projectedIncome } = useFiatPlanner();

  return (
    <div className="mt-4 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Capital (USD)" required>
          <input
            type="number"
            min={0}
            value={state.capital ?? ""}
            onChange={(e) =>
              setField(
                "capital",
                e.target.value ? Number(e.target.value) : 0
              )
            }
            className="w-full rounded border border-border bg-surface-card px-3 py-2 font-mono"
          />
        </FormField>
      </div>
      {projectedIncome != null && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ResultCell
            label="Annual Min"
            value={`$${projectedIncome.annualMin.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
          <ResultCell
            label="Annual Max"
            value={`$${projectedIncome.annualMax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
          <ResultCell
            label="Monthly Min"
            value={`$${projectedIncome.monthlyMin.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
          <ResultCell
            label="Monthly Max"
            value={`$${projectedIncome.monthlyMax.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
        </div>
      )}
    </div>
  );
}
