import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeStablecoinProjections } from "@/lib/planner/stablecoin";

const schema = z.object({
  capital: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.parse(body);
    const result = computeStablecoinProjections(parsed.capital);
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
