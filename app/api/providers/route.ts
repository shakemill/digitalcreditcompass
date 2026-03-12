import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const querySchema = z.object({
  plannerType: z.enum(["BTC", "FIAT", "STABLECOIN"]).optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  sort: z.enum(["score_desc", "score_asc", "name"]).optional(),
});

const postSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  plannerType: z.enum(["BTC", "FIAT", "STABLECOIN"]),
  domicile: z.string().min(1),
  jurisdictionTier: z.enum(["T1", "T2", "T3", "UNKNOWN"]),
  isActive: z.boolean().optional(),
  apyMin: z.number().optional(),
  apyMax: z.number().optional(),
  maxLtv: z.number().optional(),
  liquidationLtv: z.number().optional(),
  rehypothecation: z.enum(["NO", "DISCLOSED", "UNDISCLOSED"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      plannerType: searchParams.get("plannerType") ?? undefined,
      minScore: searchParams.get("minScore") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const { plannerType, minScore, sort = "score_desc" } = parsed.data;

    const providers = await db.provider.findMany({
      where: plannerType ? { plannerType } : undefined,
      include: {
        scoreSnapshots: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    let list = providers.map((p) => {
      const latest = p.scoreSnapshots[0];
      return {
        ...p,
        latestScore: latest?.finalScore ?? null,
        latestRiskBand: latest?.riskBand ?? null,
      };
    });

    if (minScore != null) {
      list = list.filter((p) => (p.latestScore ?? 0) >= minScore);
    }

    if (sort === "score_desc") {
      list.sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0));
    } else if (sort === "score_asc") {
      list.sort((a, b) => (a.latestScore ?? 0) - (b.latestScore ?? 0));
    } else if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    const result = list.map(({ scoreSnapshots, ...p }) => ({
      ...p,
      latestScore: (p as { latestScore?: number }).latestScore,
      latestRiskBand: (p as { latestRiskBand?: string }).latestRiskBand,
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const data = parsed.data;
    const provider = await db.provider.create({
      data: {
        name: data.name,
        slug: data.slug,
        plannerType: data.plannerType,
        domicile: data.domicile,
        jurisdictionTier: data.jurisdictionTier,
        isActive: data.isActive ?? false,
        apyMin: data.apyMin,
        apyMax: data.apyMax,
        maxLtv: data.maxLtv,
        liquidationLtv: data.liquidationLtv,
        rehypothecation: data.rehypothecation,
      },
    });
    return NextResponse.json(provider);
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
