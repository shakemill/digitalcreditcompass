import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pack = await db.evidencePack.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true, slug: true, plannerType: true },
        },
      },
    });
    if (!pack) {
      return NextResponse.json(
        { error: "Evidence pack not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(pack);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
