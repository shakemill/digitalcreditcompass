import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const stablecoinTypesSchema = z.array(z.enum(["USDC", "USDT"])).nullable().optional();

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  plannerType: z.enum(["BTC", "FIAT", "STABLECOIN"]).optional(),
  domicile: z.string().min(1).optional(),
  jurisdictionTier: z.enum(["T1", "T2", "T3", "UNKNOWN"]).optional(),
  isActive: z.boolean().optional(),
  apyMin: z.preprocess((v) => (v === "" ? null : v === undefined ? undefined : Number(v)), z.number().nullable().optional()),
  apyMax: z.preprocess((v) => (v === "" ? null : v === undefined ? undefined : Number(v)), z.number().nullable().optional()),
  maxLtv: z.number().nullable().optional(),
  liquidationLtv: z.number().nullable().optional(),
  rehypothecation: z.enum(["NO", "DISCLOSED", "UNDISCLOSED"]).optional(),
  providerCategory: z.enum(["CEFI", "DEFI"]).nullable().optional(),
  stablecoinTypes: stablecoinTypesSchema,
  pegType: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const provider = await db.provider.findUnique({
      where: { id },
      include: {
        scoreSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        scoringInputs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const latestSnapshot = provider.scoreSnapshots[0] ?? null;
    const latestInput = provider.scoringInputs?.[0] ?? null;
    const { scoreSnapshots, scoringInputs, ...rest } = provider;
    return NextResponse.json({
      ...rest,
      latestSnapshot,
      latestScoringInput: latestInput,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const existing = await db.provider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    const data = parsed.data as Record<string, unknown>;
    const provider = await db.provider.update({
      where: { id },
      data: Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      ) as Parameters<typeof db.provider.update>[0]["data"],
    });
    return NextResponse.json(provider);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.provider.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }
    await db.$transaction(async (tx) => {
      await tx.scoreSnapshot.deleteMany({ where: { providerId: id } });
      await tx.scoringInput.deleteMany({ where: { providerId: id } });
      await tx.evidencePack.deleteMany({ where: { providerId: id } });
      await tx.provider.delete({ where: { id } });
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[DELETE /api/providers/[id]]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
