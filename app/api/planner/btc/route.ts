import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeBtcPlanner } from "@/lib/planner/btc";

const schema = z.object({
  totalNeed12m: z.number().min(0),
  apr: z.number(),
  btcPrice: z.number().positive(),
  ltv: z.number().min(0).max(1).refine((v) => v > 0, { message: "LTV must be greater than 0" }),
  liquidationLtv: z.number().min(0).max(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const result = computeBtcPlanner(parsed);
    return NextResponse.json(result);
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
