import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing snapshot id" }, { status: 400 });
  }
  try {
    await db.suitabilitySnapshot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message?: string }).message)
        : "Unknown error";
    if (message.includes("Record to delete does not exist") || message.includes("Record not found")) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    console.error("[DELETE /api/suitability/snapshots/:id]", err);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
