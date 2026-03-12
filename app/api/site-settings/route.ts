import { NextResponse } from "next/server";
import { getComingSoonEnabled } from "@/lib/site-settings";

export async function GET() {
  const comingSoonEnabled = await getComingSoonEnabled();
  return NextResponse.json({ comingSoonEnabled });
}
