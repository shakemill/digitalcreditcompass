import type { AllocationEntry } from "@/lib/portfolio/allocator";

export function generateRiskNotes(allocations: AllocationEntry[]): string[] {
  const notes: string[] = [];

  const elevated = allocations.filter(
    (a) => a.riskBand === "ELEVATED" || a.riskBand === "HIGH"
  );
  if (elevated.length > 0) {
    notes.push(
      `${elevated.map((e) => e.providerName).join(", ")} ${elevated.length > 1 ? "are" : "is"} rated ${elevated[0].riskBand} — consider reducing allocation weight.`
    );
  }

  const rehyp = allocations.filter(
    (a) =>
      (a as AllocationEntry & { rehypothecation?: string }).rehypothecation ===
      "DISCLOSED"
  );
  if (rehyp.length > 0) {
    notes.push(
      `${rehyp.map((r) => r.providerName).join(", ")} disclose rehypothecation practices, which introduce additional counterparty risk.`
    );
  }

  const lowScore = allocations.filter((a) => a.dccScore < 60);
  if (lowScore.length > 0) {
    notes.push(
      `${lowScore.map((l) => l.providerName).join(", ")} score below the guided threshold of 60 — manual override detected.`
    );
  }

  // Max 5 notes
  return notes.slice(0, 5);
}
