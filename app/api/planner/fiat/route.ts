import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeFiatProjections } from "@/lib/planner/fiat";

const schema = z.object({
  capital: z.number().min(0),
  apyMin: z.number(),
  apyMax: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const result = computeFiatProjections(
      parsed.capital,
      parsed.apyMin,
      parsed.apyMax
    );
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
