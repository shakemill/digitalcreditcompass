/**
 * T1 — Déterminisme du scoring engine
 * Mêmes inputs × 100 runs → output identique à chaque fois
 */
import { computeScore } from "../lib/scoring/engine";
import type { ScoringInputData } from "../types/scoring";

const BTC_INPUTS: ScoringInputData = {
  transparency: 80,
  collateralControl: 75,
  jurisdiction: 70,
  structuralRisk: 65,
  trackRecord: 60,
};

const FIAT_INPUTS: ScoringInputData = {
  marketVolatility: 72,
  incomeMechanism: 68,
  seniority: 65,
  complexity: 60,
  providerQuality: 70,
  hv30: 28,
};

const STABLECOIN_INPUTS: ScoringInputData = {
  reserveQuality: 75,
  yieldTransparency: 70,
  counterpartyRisk: 65,
  liquidity: 70,
  jurisdiction: 68,
  trackRecord: 60,
};

const RUNS = 100;

function runDeterminismTest(
  plannerType: "BTC" | "FIAT" | "STABLECOIN",
  inputs: ScoringInputData,
  durationMonths: number,
  isAlgoStablecoin?: boolean
) {
  const first = computeScore(
    plannerType,
    inputs,
    durationMonths,
    isAlgoStablecoin ?? false
  );
  for (let i = 0; i < RUNS - 1; i++) {
    const result = computeScore(
      plannerType,
      inputs,
      durationMonths,
      isAlgoStablecoin ?? false
    );
    if (
      result.rawScore !== first.rawScore ||
      result.finalScore !== first.finalScore ||
      result.riskBand !== first.riskBand ||
      result.durationMultiplier !== first.durationMultiplier
    ) {
      throw new Error(
        `T1 FAIL: ${plannerType} run ${i + 2} diverged. Expected finalScore=${first.finalScore}, got ${result.finalScore}`
      );
    }
  }
  console.log(`T1 PASS: ${plannerType} (${RUNS} runs identical)`);
}

runDeterminismTest("BTC", BTC_INPUTS, 12);
runDeterminismTest("FIAT", FIAT_INPUTS, 6);
runDeterminismTest("FIAT", { ...FIAT_INPUTS, hv30: 40 }, 6); // HV30 cap
runDeterminismTest("STABLECOIN", STABLECOIN_INPUTS, 12);
runDeterminismTest("STABLECOIN", STABLECOIN_INPUTS, 12, true); // Algo cap 20

console.log("All T1 determinism tests passed.");
