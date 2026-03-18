import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

const schema = z.object({
  plannerModule: z.enum(["1A", "1B", "1C"]),
  clientName: z.string().optional(),
  riskPreference: z.string().optional(),
  snapshot: z.any(), // planner snapshot object (nested)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const session = await getSessionFromCookie();

    if (session?.role === "FREE" && session.sub) {
      const count = await db.suitabilitySnapshot.count({
        where: { userId: session.sub },
      });
      if (count >= 1) {
        return NextResponse.json(
          {
            error: "FREE_PLAN_REPORT_LIMIT",
            message:
              "Free plan allows only one saved report. Delete your existing report in Reports or upgrade to PRO to save more.",
          },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const id = uuidv4();

    await db.suitabilitySnapshot.create({
      data: {
        id,
        userId: session?.sub ?? null,
        dccVersion: "1.0",
        plannerModule: parsed.plannerModule,
        generatedAt: now,
        dataAsOf: now,
        inputs: parsed.snapshot as object,
        allocation: [],
        outputs: {
          source: "planner",
          plannerModule: parsed.plannerModule,
          generatedAt: now.toISOString(),
        },
        riskNotes: [],
        disclaimers: [],
        provenance: { source: "planner" },
        clientName: parsed.clientName ?? null,
        riskPreference: parsed.riskPreference ?? null,
      },
    });

    return NextResponse.json({ id, plannerModule: parsed.plannerModule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[create-from-planner] Validation error:", error.issues);
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[create-from-planner] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
