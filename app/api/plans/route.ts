import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  const plans = await db.plan.findMany({
    orderBy: { slug: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      priceYearCents: true,
      priceMonthCents: true,
      stripePriceIdYear: true,
      stripePriceIdMonth: true,
    },
  });
  return NextResponse.json(plans);
}
