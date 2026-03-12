export interface BtcPlannerInputs {
  totalNeed12m: number;
  apr: number;
  btcPrice: number;
  ltv: number;
  liquidationLtv?: number;
  durationMonths?: number;
}

export interface BtcPlannerResult {
  btcRequired: number;
  monthlyTarget: number;
  marginCallPrice: number;
  liquidationPrice: number;
  sri: number;
  riskBand: "GREEN" | "AMBER" | "RED";
  collateralUSD: number;
  totalInterest: number;
  totalCost: number;
  durationMonths: number;
}

export function computeBtcPlanner(inputs: BtcPlannerInputs): BtcPlannerResult {
  const {
    totalNeed12m,
    btcPrice,
    ltv,
    apr,
    liquidationLtv = 0.85,
    durationMonths = 12,
  } = inputs;

  const durationFactor = durationMonths / 12;
  const btcRequired = totalNeed12m / (btcPrice * ltv);
  const monthlyTarget = totalNeed12m / 12;
  const marginCallPrice = totalNeed12m / (btcRequired * 0.75);
  const liquidationPrice = totalNeed12m / (btcRequired * liquidationLtv);
  const sri = Math.min(
    100,
    Math.max(0, 100 * Math.pow(ltv / liquidationLtv, 2))
  );
  const collateralUSD = btcRequired * btcPrice;
  const totalInterest = totalNeed12m * (apr / 100) * durationFactor;
  const totalCost = totalNeed12m + totalInterest;
  const riskBand: BtcPlannerResult["riskBand"] =
    ltv <= 0.5 ? "GREEN" : ltv <= 0.75 ? "AMBER" : "RED";

  return {
    btcRequired,
    monthlyTarget,
    marginCallPrice,
    liquidationPrice,
    sri: parseFloat(sri.toFixed(1)),
    riskBand,
    collateralUSD,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    durationMonths,
  };
}

export function getBtcScenarios(totalNeed12m: number, btcPrice: number) {
  return [10, 25, 50, 75].map((pct) => {
    const ltv = pct / 100;
    const btcReq = totalNeed12m / (btcPrice * ltv);
    const liqPrice = totalNeed12m / (btcReq * 0.85);
    const sri = Math.min(100, 100 * Math.pow(ltv / 0.85, 2));
    return { ltv: pct, btcRequired: btcReq, liquidationPrice: liqPrice, sri };
  });
}
