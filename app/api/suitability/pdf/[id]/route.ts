import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import path from "path";
import fs from "fs";
import { db } from "@/lib/db";
import { getSessionFromCookie } from "@/lib/auth/session";
import { SuitabilityPDF } from "@/components/report/SuitabilityPDF";
import { BtcPdfDocument } from "@/lib/pdf/generateBtcPdf";
import { FiatPdfDocument } from "@/lib/pdf/generateFiatPdf";
import { StablecoinPdfDocument } from "@/lib/pdf/generateStablecoinPdf";
import type {
  BtcScenarioSnapshot,
  ClientInfo,
  FiatScenarioSnapshot,
  StablecoinScenarioSnapshot,
} from "@/context/PlannerContext";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    const role = session?.role;
    if (role !== "PRO" && role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "PDF export is available for PRO members. Upgrade at /pricing." },
        { status: 403 }
      );
    }
    const { id } = await params;
    const snapshot = await db.suitabilitySnapshot.findUnique({
      where: { id },
    });
    if (!snapshot) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const plannerLabel =
      snapshot.plannerModule === "1A"
        ? "BTC"
        : snapshot.plannerModule === "1B"
          ? "Fiat"
          : snapshot.plannerModule === "1C"
            ? "Stablecoin"
            : "Portfolio";
    const dateStr =
      snapshot.generatedAt instanceof Date
        ? snapshot.generatedAt.toISOString().slice(0, 10)
        : new Date(snapshot.generatedAt as unknown as string).toISOString().slice(0, 10);
    const safePlanner = plannerLabel.replace(/[^A-Za-z0-9_-]+/g, "_");
    const filename = `DCC_ScenarioOutput_${safePlanner}_${dateStr}.pdf`;

    const riskPref = snapshot.riskPreference ?? "Moderate";
    const client: ClientInfo = {
      clientName: snapshot.clientName ?? "",
      riskPreference:
        riskPref === "Conservative" || riskPref === "Moderate" || riskPref === "Aggressive"
          ? riskPref
          : "Moderate",
    };

    let logoSrc: string | undefined;
    const logoPath = path.join(process.cwd(), "public", "logo-dcc-pdf-cover.png");
    if (fs.existsSync(logoPath)) {
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      } catch {
        // leave logoSrc undefined if read fails
      }
    }

    let doc: React.ReactElement;
    if (snapshot.plannerModule === "1A" && snapshot.inputs && typeof snapshot.inputs === "object") {
      doc = React.createElement(BtcPdfDocument, {
        snapshot: snapshot.inputs as unknown as BtcScenarioSnapshot,
        client,
        logoSrc,
      });
    } else if (snapshot.plannerModule === "1B" && snapshot.inputs && typeof snapshot.inputs === "object") {
      doc = React.createElement(FiatPdfDocument, {
        snapshot: snapshot.inputs as unknown as FiatScenarioSnapshot,
        client,
        logoSrc,
      });
    } else if (snapshot.plannerModule === "1C" && snapshot.inputs && typeof snapshot.inputs === "object") {
      doc = React.createElement(StablecoinPdfDocument, {
        snapshot: snapshot.inputs as unknown as StablecoinScenarioSnapshot,
        client,
        logoSrc,
      });
    } else {
      // Portfolio / multi-module suitability: pass full snapshot for full PDF
      const allocation = Array.isArray(snapshot.allocation) ? snapshot.allocation : [];
      const outputs = snapshot.outputs && typeof snapshot.outputs === "object" ? snapshot.outputs as Record<string, unknown> : undefined;
      const inputs = snapshot.inputs && typeof snapshot.inputs === "object" ? snapshot.inputs as Record<string, unknown> : undefined;
      const riskNotes = Array.isArray(snapshot.riskNotes) ? (snapshot.riskNotes as string[]) : [];
      const disclaimers = Array.isArray(snapshot.disclaimers) ? (snapshot.disclaimers as string[]) : [];
      doc = React.createElement(SuitabilityPDF, {
        clientName: snapshot.clientName,
        dccVersion: snapshot.dccVersion,
        generatedAt: snapshot.generatedAt,
        reportId: snapshot.id,
        dataAsOf: snapshot.dataAsOf,
        riskPreference: snapshot.riskPreference,
        plannerModule: snapshot.plannerModule,
        inputs,
        allocation: allocation as Parameters<typeof SuitabilityPDF>[0]["allocation"],
        outputs: outputs as Parameters<typeof SuitabilityPDF>[0]["outputs"],
        riskNotes,
        disclaimers,
        logoSrc,
      });
    }

    const buf = await renderToBuffer(doc as Parameters<typeof renderToBuffer>[0]);
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("PDF generation error:", e);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
