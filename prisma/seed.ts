import "dotenv/config";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for seed");

const prisma = new PrismaClient();

function riskBandFromScore(score: number): "LOW" | "MEDIUM" | "ELEVATED" | "HIGH" {
  if (score >= 80) return "LOW";
  if (score >= 60) return "MEDIUM";
  if (score >= 40) return "ELEVATED";
  return "HIGH";
}

async function main() {
  // ─── Plans (tarifs: non en dur) ─────────────────────────────
  await prisma.plan.upsert({
    where: { slug: "free" },
    create: { slug: "free", name: "Free", priceYearCents: 0, priceMonthCents: 0 },
    update: {},
  });
  await prisma.plan.upsert({
    where: { slug: "pro" },
    create: {
      slug: "pro",
      name: "PRO",
      priceYearCents: 36000,  // 360 USD
      priceMonthCents: 4500,  // 45 USD
    },
    update: {},
  });

  await prisma.scoreSnapshot.deleteMany({});
  await prisma.scoringInput.deleteMany({});

  // ─── BTC Providers (9 per DCC spec: AMINA, Sygnum, Xapo, Unchained, Matrixport, Ledn, Nexo, Salt, Hodl Hodl) ───
  const btcProviders = [
    { name: "AMINA Bank", slug: "amina", tier: "T1" as const, score: 81, apyMin: 0.06, apyMax: 0.08, rehyp: "NO" as const, maxLtv: 0.5, liqLtv: 0.85 },
    { name: "Sygnum", slug: "sygnum", tier: "T1" as const, score: 79, apyMin: 0.05, apyMax: 0.07, rehyp: "NO" as const, maxLtv: 0.5, liqLtv: 0.85 },
    { name: "Xapo", slug: "xapo", tier: "T1" as const, score: 77, apyMin: 0.04, apyMax: 0.06, rehyp: "NO" as const, maxLtv: 0.45, liqLtv: 0.8 },
    { name: "Unchained", slug: "unchained", tier: "T1" as const, score: 76, apyMin: 0.05, apyMax: 0.07, rehyp: "NO" as const, maxLtv: 0.5, liqLtv: 0.85 },
    { name: "Matrixport", slug: "matrixport", tier: "T2" as const, score: 74, apyMin: 0.06, apyMax: 0.09, rehyp: "DISCLOSED" as const, maxLtv: 0.5, liqLtv: 0.83 },
    { name: "Ledn", slug: "ledn", tier: "T1" as const, score: 78, apyMin: 0.08, apyMax: 0.1, rehyp: "NO" as const, maxLtv: 0.5, liqLtv: 0.85 },
    { name: "Nexo", slug: "nexo", tier: "T2" as const, score: 71, apyMin: 0.08, apyMax: 0.11, rehyp: "DISCLOSED" as const, maxLtv: 0.5, liqLtv: 0.83 },
    { name: "Salt Lending", slug: "salt", tier: "T1" as const, score: 65, apyMin: 0.1, apyMax: 0.12, rehyp: "NO" as const, maxLtv: 0.6, liqLtv: 0.8 },
    { name: "Hodl Hodl", slug: "hodl-hodl", tier: "T2" as const, score: 62, apyMin: 0.03, apyMax: 0.05, rehyp: "NO" as const, maxLtv: 0.4, liqLtv: 0.75 },
  ];

  for (const p of btcProviders) {
    const provider = await prisma.provider.upsert({
      where: { slug: p.slug },
      create: {
        name: p.name,
        slug: p.slug,
        plannerType: "BTC",
        domicile: "CH",
        jurisdictionTier: p.tier,
        isActive: true,
        apyMin: p.apyMin,
        apyMax: p.apyMax,
        maxLtv: p.maxLtv ?? 0.5,
        liquidationLtv: p.liqLtv ?? 0.85,
        rehypothecation: p.rehyp,
      },
      update: {},
    });

    const input = await prisma.scoringInput.create({
      data: {
        providerId: provider.id,
        transparency: 82,
        collateralControl: 80,
        jurisdiction: 85,
        structuralRisk: 78,
        trackRecord: 80,
        allFieldsApproved: true,
        adminApprovedBy: "seed",
        adminApprovedAt: new Date(),
      },
    });

    await prisma.scoreSnapshot.create({
      data: {
        providerId: provider.id,
        scoringInputId: input.id,
        rawScore: p.score,
        durationMultiplier: 1,
        finalScore: p.score,
        riskBand: riskBandFromScore(p.score),
        scoreVersion: "1.0",
        plannerType: "BTC",
        criteriaBreakdown: {
          transparency: 82,
          collateralControl: 80,
          jurisdiction: 85,
          structuralRisk: 78,
          trackRecord: 80,
        },
      },
    });
  }

  // ─── FIAT Instruments (4 tickers) ─────────────────────────────────
  const fiatInstruments = [
    { name: "STRC", slug: "strc", score: 62, apy: 0.07, hv30: 28 },
    { name: "STRK", slug: "strk", score: 59, apy: 0.08, hv30: 28 },
    { name: "STRF", slug: "strf", score: 55, apy: 0.1, hv30: 28 },
    { name: "SATA", slug: "sata", score: 48, apy: 0.0885, hv30: 41 },
  ];

  for (const f of fiatInstruments) {
    const provider = await prisma.provider.upsert({
      where: { slug: f.slug },
      create: {
        name: f.name,
        slug: f.slug,
        plannerType: "FIAT",
        domicile: "US",
        jurisdictionTier: "T1",
        isActive: true,
        apyMin: f.apy * 0.95,
        apyMax: f.apy * 1.05,
        rehypothecation: "UNDISCLOSED",
      },
      update: {},
    });

    const input = await prisma.scoringInput.create({
      data: {
        providerId: provider.id,
        marketVolatility: 70,
        incomeMechanism: 65,
        seniority: 60,
        complexity: 58,
        providerQuality: 62,
        hv30: f.hv30,
        allFieldsApproved: true,
        adminApprovedBy: "seed",
        adminApprovedAt: new Date(),
      },
    });

    await prisma.scoreSnapshot.create({
      data: {
        providerId: provider.id,
        scoringInputId: input.id,
        rawScore: f.score,
        durationMultiplier: 1,
        finalScore: f.score,
        riskBand: riskBandFromScore(f.score),
        scoreVersion: "1.0",
        plannerType: "FIAT",
        criteriaBreakdown: {
          marketVolatility: 70,
          incomeMechanism: 65,
          seniority: 60,
          complexity: 58,
          providerQuality: 62,
        },
      },
    });
  }

  // ─── STABLECOIN Providers: DeFi (3) + CeFi (2) ─────────────────────
  const stblProviders = [
    // DeFi (on-chain)
    { name: "Morpho USDC", slug: "morpho-usdc", score: 79, apyMin: 0.07, apyMax: 0.09 },
    { name: "Aave USDC", slug: "aave-usdc", score: 76, apyMin: 0.06, apyMax: 0.08 },
    { name: "Compound v3", slug: "compound-v3", score: 68, apyMin: 0.05, apyMax: 0.07 },
    // CeFi (custodial)
    { name: "Ledn USDC", slug: "ledn-usdc", score: 72, apyMin: 0.05, apyMax: 0.07 },
    { name: "Nexo USDC", slug: "nexo-usdc", score: 70, apyMin: 0.04, apyMax: 0.06 },
  ];

  for (const s of stblProviders) {
    const provider = await prisma.provider.upsert({
      where: { slug: s.slug },
      create: {
        name: s.name,
        slug: s.slug,
        plannerType: "STABLECOIN",
        domicile: "US",
        jurisdictionTier: "T1",
        isActive: true,
        apyMin: s.apyMin,
        apyMax: s.apyMax,
        rehypothecation: "NO",
      },
      update: {},
    });

    const input = await prisma.scoringInput.create({
      data: {
        providerId: provider.id,
        reserveQuality: 82,
        yieldTransparency: 78,
        counterpartyRisk: 76,
        liquidity: 80,
        allFieldsApproved: true,
        adminApprovedBy: "seed",
        adminApprovedAt: new Date(),
      },
    });

    await prisma.scoreSnapshot.create({
      data: {
        providerId: provider.id,
        scoringInputId: input.id,
        rawScore: s.score,
        durationMultiplier: 1,
        finalScore: s.score,
        riskBand: riskBandFromScore(s.score),
        scoreVersion: "1.0",
        plannerType: "STABLECOIN",
        criteriaBreakdown: {
          reserveQuality: 82,
          yieldTransparency: 78,
          counterpartyRisk: 76,
          liquidity: 80,
        },
      },
    });
  }

  // ─── Sample Suitability Snapshots (so /reports has data) ─────────────────
  const now = new Date();
  const sampleBtcSnapshot = {
    module: "1A",
    inputs: { totalNeed12m: 120000, btcPrice: 60000, apr: 8, ltv: 50, durationMonths: 12, liquidationLtv: 85 },
    results: { btcRequired: 0.5, monthlyTarget: 10000, marginCallPrice: 45000, liquidationPrice: 42000, totalInterest: 2000, totalCost: 0, sri: 22, riskBand: "GREEN", collateralUSD: 30000 },
    yieldBoard: [{ name: "AMINA Bank", score: 81, adjustedScore: 78, apy: "6–8%", multiplier: 0.97 }],
    savedAt: now.toISOString(),
  };
  const sampleFiatSnapshot = {
    module: "1B",
    inputs: { capital: 100000, durationMonths: 12, mode: "custom", selectedTickers: ["STRC", "STRK"] },
    results: { annualMin: 4000, annualMax: 6000, monthlyMin: 333, monthlyMax: 500, totalMin: 4000, totalMax: 6000 },
    instruments: [],
    blendedApy: { min: 4, max: 6 },
    savedAt: now.toISOString(),
  };
  const sampleStableSnapshot = {
    module: "1C",
    inputs: { capital: 50000, durationMonths: 12, mode: "guided", selectedProto: "USDC", cefiPct: 70, defiPct: 30 },
    results: { annualMin: 2500, annualMax: 3500, monthlyMin: 208, monthlyMax: 292, totalMin: 2500, totalMax: 3500 },
    providers: [],
    savedAt: now.toISOString(),
  };

  const id1A = "a0000001-0000-4000-8000-000000000001";
  const id1B = "a0000001-0000-4000-8000-000000000002";
  const id1C = "a0000001-0000-4000-8000-000000000003";

  await prisma.suitabilitySnapshot.upsert({
    where: { id: id1A },
    create: {
      id: id1A,
      dccVersion: "1.0",
      plannerModule: "1A",
      generatedAt: now,
      dataAsOf: now,
      inputs: sampleBtcSnapshot,
      allocation: [],
      outputs: { source: "planner", plannerModule: "1A", generatedAt: now.toISOString() },
      riskNotes: [],
      disclaimers: [],
      provenance: { source: "seed" },
      clientName: "Sample Client (BTC)",
      riskPreference: "Moderate",
    },
    update: { generatedAt: now, inputs: sampleBtcSnapshot },
  });
  await prisma.suitabilitySnapshot.upsert({
    where: { id: id1B },
    create: {
      id: id1B,
      dccVersion: "1.0",
      plannerModule: "1B",
      generatedAt: now,
      dataAsOf: now,
      inputs: sampleFiatSnapshot,
      allocation: [],
      outputs: { source: "planner", plannerModule: "1B", generatedAt: now.toISOString() },
      riskNotes: [],
      disclaimers: [],
      provenance: { source: "seed" },
      clientName: "Sample Client (Fiat)",
      riskPreference: "Conservative",
    },
    update: { generatedAt: now, inputs: sampleFiatSnapshot },
  });
  await prisma.suitabilitySnapshot.upsert({
    where: { id: id1C },
    create: {
      id: id1C,
      dccVersion: "1.0",
      plannerModule: "1C",
      generatedAt: now,
      dataAsOf: now,
      inputs: sampleStableSnapshot,
      allocation: [],
      outputs: { source: "planner", plannerModule: "1C", generatedAt: now.toISOString() },
      riskNotes: [],
      disclaimers: [],
      provenance: { source: "seed" },
      clientName: "Sample Client (Stablecoin)",
      riskPreference: "Moderate",
    },
    update: { generatedAt: now, inputs: sampleStableSnapshot },
  });

  // ─── Site settings (coming soon) ─────────────────────────────
  await prisma.siteSetting.upsert({
    where: { key: "coming_soon_enabled" },
    create: { key: "coming_soon_enabled", value: "false" },
    update: {},
  });

  console.log("Seed completed: Plans (free, pro), 9 BTC, 4 FIAT, 5 STABLECOIN (3 DeFi + 2 CeFi) + 3 sample SuitabilitySnapshot reports + site settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
