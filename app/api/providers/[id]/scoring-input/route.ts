import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const btcFields = z.object({
  transparency: z.number().min(0).max(100),
  collateralControl: z.number().min(0).max(100),
  jurisdiction: z.number().min(0).max(100),
  structuralRisk: z.number().min(0).max(100),
  trackRecord: z.number().min(0).max(100),
});

const fiatFields = z.object({
  marketVolatility: z.number().min(0).max(100),
  incomeMechanism: z.number().min(0).max(100),
  seniority: z.number().min(0).max(100),
  complexity: z.number().min(0).max(100),
  providerQuality: z.number().min(0).max(100),
  hv30: z.number().min(0).optional(),
});

const stablecoinFields = z.object({
  reserveQuality: z.number().min(0).max(100),
  yieldTransparency: z.number().min(0).max(100),
  counterpartyRisk: z.number().min(0).max(100),
  liquidity: z.number().min(0).max(100),
});

const bodySchema = z.object({
  plannerType: z.enum(["BTC", "FIAT", "STABLECOIN"]),
  btc: btcFields.optional(),
  fiat: fiatFields.optional(),
  stablecoin: stablecoinFields.optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const provider = await db.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const { plannerType } = parsed.data;
    const data: Record<string, unknown> = {
      providerId,
      allFieldsApproved: false,
    };
    if (plannerType === "BTC" && parsed.data.btc) {
      Object.assign(data, parsed.data.btc);
    } else if (plannerType === "FIAT" && parsed.data.fiat) {
      Object.assign(data, parsed.data.fiat);
    } else if (plannerType === "STABLECOIN" && parsed.data.stablecoin) {
      Object.assign(data, parsed.data.stablecoin);
    } else {
      return NextResponse.json(
        { error: "Missing criteria for " + plannerType },
        { status: 400 }
      );
    }
    const input = await db.scoringInput.create({
      data: data as Parameters<typeof db.scoringInput.create>[0]["data"],
    });
    return NextResponse.json(input);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: providerId } = await params;
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const provider = await db.provider.findUnique({ where: { id: providerId } });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const latest = await db.scoringInput.findFirst({
      where: { providerId },
      orderBy: { createdAt: "desc" },
    });
    if (!latest) {
      return NextResponse.json(
        { error: "No scoring input to update. POST to create one." },
        { status: 400 }
      );
    }
    const { plannerType } = parsed.data;
    const data: Record<string, unknown> = {};
    if (plannerType === "BTC" && parsed.data.btc) {
      Object.assign(data, parsed.data.btc);
    } else if (plannerType === "FIAT" && parsed.data.fiat) {
      Object.assign(data, parsed.data.fiat);
    } else if (plannerType === "STABLECOIN" && parsed.data.stablecoin) {
      Object.assign(data, parsed.data.stablecoin);
    } else {
      return NextResponse.json(
        { error: "Missing criteria for " + plannerType },
        { status: 400 }
      );
    }
    const updated = await db.scoringInput.update({
      where: { id: latest.id },
      data: data as Parameters<typeof db.scoringInput.update>[0]["data"],
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
