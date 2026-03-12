// ⚠ IMMUTABLE — DO NOT MODIFY WITHOUT CRO APPROVAL
// Never move these values to the database

export const WEIGHTS = {
  BTC: {
    transparency:      0.30,
    collateralControl: 0.25,
    jurisdiction:      0.20,
    structuralRisk:    0.15,
    trackRecord:       0.10,
  },
  FIAT: {
    marketVolatility: 0.30,
    incomeMechanism:  0.25,
    seniority:        0.15,
    complexity:       0.15,
    providerQuality:  0.15,
  },
  STABLECOIN: {
    reserveQuality:    0.28,
    yieldTransparency: 0.22,
    counterpartyRisk:  0.20,
    liquidity:         0.15,
    jurisdiction:      0.10,
    trackRecord:       0.05,
  },
} as const

export const DURATION_MULTIPLIERS = [
  { minMonths: 0,  maxMonths: 2,  multiplier: 1.00 },
  { minMonths: 3,  maxMonths: 5,  multiplier: 0.97 },
  { minMonths: 6,  maxMonths: 11, multiplier: 0.93 },
  { minMonths: 12, maxMonths: 23, multiplier: 0.87 },
  { minMonths: 24, maxMonths: Infinity, multiplier: 0.80 },
] as const

export const HARD_RULES = {
  ALGO_STABLECOIN_CAP: 20,
  PEG_DEVIATION_AUTO_FLAG: 0.015,  // 1.5% → AUTO HIGH RISK
  HV30_FIAT_CAP_THRESHOLD: 35,     // >35% → C1 capped at 5/30
  HV30_FIAT_C1_CAP: 5,
  MIN_SCORE_GUIDED_MODE: 60,       // Guided mode filters below 60
} as const
