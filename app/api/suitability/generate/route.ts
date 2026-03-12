import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { buildSuitabilitySnapshot } from "@/lib/suitability/snapshot-builder";
import type { AllocationEntry } from "@/lib/portfolio/allocator";

const allocationSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  ticker: z.string().optional(),
  plannerType: z.enum(["BTC", "FIAT", "STABLECOIN"]),
  weightPct: z.number().min(0).max(100),
  apyMin: z.number(),
  apyMax: z.number(),
  dccScore: z.number(),
  riskBand: z.string(),
  keyRiskNote: z.string().optional(),
});

const schema = z.object({
  plannerModule: z.string(),
  inputs: z.record(z.string(), z.unknown()),
  allocations: z.array(allocationSchema),
  capitalUSD: z.number().min(0),
  durationMonths: z.number().min(0),
  clientName: z.string().optional(),
  riskPreference: z.string().optional(),
  scoreSnapshots: z.array(
    z.object({
      providerId: z.string(),
      snapshotId: z.string(),
      dataAsOf: z.string().or(z.coerce.date()),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);

    const scoreSnapshots = parsed.scoreSnapshots.map((s) => ({
      providerId: s.providerId,
      snapshotId: s.snapshotId,
      dataAsOf: typeof s.dataAsOf === "string" ? new Date(s.dataAsOf) : s.dataAsOf,
    }));

    const allocations = parsed.allocations as (AllocationEntry & {
      keyRiskNote?: string;
    })[];

    const snapshot = buildSuitabilitySnapshot({
      plannerModule: parsed.plannerModule,
      inputs: parsed.inputs,
      allocations,
      capitalUSD: parsed.capitalUSD,
      durationMonths: parsed.durationMonths,
      clientName: parsed.clientName,
      riskPreference: parsed.riskPreference,
      scoreSnapshots,
    });

    const session = await getSessionFromCookie();
    const record = await db.suitabilitySnapshot.create({
      data: {
        id: snapshot.reportId,
        userId: session?.sub ?? null,
        dccVersion: snapshot.dccVersion,
        plannerModule: snapshot.plannerModule,
        generatedAt: new Date(snapshot.generatedAt),
        dataAsOf: new Date(snapshot.dataAsOf),
        inputs: snapshot.inputs as object,
        allocation: snapshot.allocation as object[],
        outputs: snapshot.outputs as object,
        riskNotes: snapshot.riskNotes as object,
        disclaimers: snapshot.disclaimers as object,
        provenance: snapshot.provenance as object,
        clientName: snapshot.clientName,
        riskPreference: snapshot.riskPreference,
      },
    });

    return NextResponse.json({ ...snapshot, id: record.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
