export function computeFiatProjections(
  capital: number,
  apyMin: number,
  apyMax: number,
  durationMonths: number = 12
) {
  const durationFactor = durationMonths / 12;
  return {
    annualMin: capital * (apyMin / 100),
    annualMax: capital * (apyMax / 100),
    monthlyMin: (capital * (apyMin / 100)) / 12,
    monthlyMax: (capital * (apyMax / 100)) / 12,
    totalMin: capital * (apyMin / 100) * durationFactor,
    totalMax: capital * (apyMax / 100) * durationFactor,
    durationMonths,
  };
}
