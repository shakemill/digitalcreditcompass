import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import type { EvidenceStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const querySchema = z.object({
  status: z.enum(["PENDING", "PARTIAL", "APPROVED", "REJECTED"]).optional(),
  providerId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      status: searchParams.get("status") ?? undefined,
      providerId: searchParams.get("providerId") ?? undefined,
    });

    const where: Prisma.EvidencePackWhereInput = {};
    if (parsed.success) {
      if (parsed.data.status) where.adminStatus = parsed.data.status as EvidenceStatus;
      if (parsed.data.providerId) where.providerId = parsed.data.providerId;
    }

    const packs = await db.evidencePack.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          select: { id: true, name: true, slug: true, plannerType: true },
        },
      },
    });

    return NextResponse.json(packs);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
