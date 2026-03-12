import { v4 as uuidv4 } from "uuid";
import {
  computePortfolio,
  type AllocationEntry,
} from "@/lib/portfolio/allocator";
import { generateRiskNotes } from "./risk-notes";
import { LEGAL_DISCLAIMERS } from "./disclaimers";

type AllocationWithKeyRisk = AllocationEntry & { keyRiskNote?: string };

export function buildSuitabilitySnapshot(params: {
  plannerModule: string;
  inputs: Record<string, unknown>;
  allocations: AllocationWithKeyRisk[];
  capitalUSD: number;
  durationMonths: number;
  clientName?: string;
  riskPreference?: string;
  scoreSnapshots: Array<{
    providerId: string;
    snapshotId: string;
    dataAsOf: Date;
  }>;
}) {
  // ⚠ CRITICAL RULE: use frozen snapshots only
  // Never recalculate scores here

  const portfolio = computePortfolio(params.allocations, params.capitalUSD);
  const riskNotes = generateRiskNotes(params.allocations);
  const dataAsOf = params.scoreSnapshots.reduce(
    (latest, s) => (s.dataAsOf > latest ? s.dataAsOf : latest),
    new Date(0)
  );

  return {
    reportId: uuidv4(),
    dccVersion: "1.0",
    plannerModule: params.plannerModule,
    generatedAt: new Date().toISOString(),
    dataAsOf: dataAsOf.toISOString(),
    clientName: params.clientName,
    riskPreference: params.riskPreference,
    inputs: params.inputs,
    allocation: params.allocations.map((a) => ({
      providerId: a.providerId,
      providerName: a.providerName,
      ticker: a.ticker,
      weightPct: a.weightPct,
      apyMin: a.apyMin,
      apyMax: a.apyMax,
      dccScore: a.dccScore, // Frozen score — never recalculated
      riskBand: a.riskBand,
      keyRiskNote: a.keyRiskNote ?? "",
    })),
    outputs: {
      portfolioScore: portfolio.portfolioScore,
      portfolioBand: portfolio.portfolioBand,
      blendedApyMin: portfolio.blendedApyMin,
      blendedApyMax: portfolio.blendedApyMax,
      annualIncomeMin: portfolio.annualIncomeMin,
      annualIncomeMax: portfolio.annualIncomeMax,
      monthlyIncomeMin: portfolio.monthlyIncomeMin,
      monthlyIncomeMax: portfolio.monthlyIncomeMax,
    },
    riskNotes,
    disclaimers: [...LEGAL_DISCLAIMERS],
    provenance: {
      scoringMethodologyVersion: "1.0",
      methodologyUrl: "/methodology",
      scoreSnapshotRefs: params.scoreSnapshots.map((s) => s.snapshotId),
    },
  };
}
