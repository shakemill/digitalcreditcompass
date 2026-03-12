import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const postSchema = z.object({
  field: z.string().min(1),
  approvedBy: z.string().min(1).optional(),
  adminStatus: z.enum(["PENDING", "PARTIAL", "APPROVED", "REJECTED"]).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = postSchema.parse(body);

    const pack = await db.evidencePack.findUnique({
      where: { id },
    });

    if (!pack) {
      return NextResponse.json(
        { error: "Evidence pack not found" },
        { status: 404 }
      );
    }

    const updated = await db.evidencePack.update({
      where: { id },
      data: {
        reviewedBy: parsed.approvedBy ?? pack.reviewedBy,
        reviewedAt: new Date(),
        ...(parsed.adminStatus != null && { adminStatus: parsed.adminStatus }),
      },
    });

    return NextResponse.json({
      ...updated,
      message: `Field "${parsed.field}" approval recorded`,
    });
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
