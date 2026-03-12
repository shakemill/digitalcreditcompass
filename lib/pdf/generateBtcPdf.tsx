import { Document, Page, Text, View, StyleSheet, Image, pdf } from "@react-pdf/renderer";
import type { BtcScenarioSnapshot, ClientInfo } from "@/context/PlannerContext";
import { computeBtcPlanner } from "@/lib/planner/btc";

const DISCLAIMERS = [
  "This document is a scenario analysis output produced by DCC's deterministic scoring engine for informational purposes only. It does not constitute investment, financial, legal, or tax advice. It is not a regulated suitability assessment under any applicable financial services law. DCC is not a licensed investment adviser, financial adviser, broker-dealer, or credit rating agency in any jurisdiction. No fiduciary duty is created by the production or delivery of this document. This document must not be relied upon as the sole basis for any investment decision.",
  "DCC scores are computed solely from publicly available information as of the date shown. They do not incorporate private issuer disclosures, audited financial data, or undisclosed material information. Where data gaps exist, scores reflect available evidence only; the absence of information may itself indicate a risk factor. Scores are not predictions of future performance, creditworthiness, or default probability.",
  "All scenario outputs — including yield estimates, income projections, BTC collateral requirements, liquidation price thresholds, margin call trigger prices, LTV calculations, interest computations, Scenario Risk Index (SRI) values, Reference Scenario allocation weights, and blended APY figures — are illustrative and scenario-specific. They are computed from user-supplied inputs and DCC scoring data as of the date shown. Actual outcomes may differ materially. These figures do not constitute a guarantee, warranty, or representation as to actual outcomes.",
  "Digital Credit Compass is not a registered investment adviser, broker-dealer, or financial institution.",
  "Past performance is not a reliable indicator of future results. Past DCC scores, provider track records, yield histories, and prior methodology versions do not guarantee, predict, or suggest future scoring outcomes, yields, or investment performance.",
  "Users are solely responsible for their own investment decisions. DCC's liability, where permitted by applicable law, is limited to direct losses caused solely by a material error in the DCC scoring engine demonstrably attributable to DCC. DCC shall not be liable for indirect, consequential, speculative, or punitive losses. Nothing in this document limits any statutory rights you may have under applicable consumer protection or financial services law that cannot be excluded by agreement.",
  "This report does not constitute a solicitation or offer to buy or sell any financial instrument or product.",
];

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1A1714",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  // HEADER (neutral, no orange)
  headerBar: {
    backgroundColor: "#5C564E",
    height: 4,
    marginBottom: 20,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  reportTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
    letterSpacing: 0.5,
  },
  reportSubtitle: {
    fontSize: 8,
    color: "#9C9488",
    marginTop: 3,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  reportMeta: {
    fontSize: 7.5,
    color: "#9C9488",
    textAlign: "right",
  },
  // SECTIONS
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#9C9488",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1px solid #E0DBD3",
  },
  // GRID 2 COL
  row2: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  // STAT CELL
  statCell: {
    flex: 1,
    backgroundColor: "#F5F4F0",
    borderRadius: 6,
    padding: 10,
    borderLeft: "3px solid #5C564E",
  },
  statLabel: {
    fontSize: 7,
    color: "#9C9488",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
  statSub: {
    fontSize: 7,
    color: "#9C9488",
    marginTop: 2,
  },
  // RISK CELLS (margin, liq) — neutral
  warnCell: {
    flex: 1,
    backgroundColor: "#F5F4F0",
    borderRadius: 6,
    padding: 10,
    borderLeft: "3px solid #5C564E",
  },
  warnValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
  dangerCell: {
    flex: 1,
    backgroundColor: "#F5F4F0",
    borderRadius: 6,
    padding: 10,
    borderLeft: "3px solid #3F3D3A",
  },
  dangerValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
  // TABLE
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F5F4F0",
    padding: "6 8",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "6 8",
    borderBottom: "1px solid #F0EDE8",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "6 8",
    backgroundColor: "#FAFAF8",
    borderBottom: "1px solid #F0EDE8",
  },
  th: {
    fontSize: 7,
    color: "#9C9488",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 8.5,
    color: "#1A1714",
  },
  tdMono: {
    fontSize: 8.5,
    color: "#1A1714",
    fontFamily: "Helvetica-Bold",
  },
  tdGreen: {
    fontSize: 8.5,
    color: "#059669",
    fontFamily: "Helvetica-Bold",
  },
  tdOrange: {
    fontSize: 8.5,
    color: "#1A1714",
    fontFamily: "Helvetica-Bold",
  },
  // CLIENT CARD
  clientCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F5F4F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  clientField: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 7,
    color: "#9C9488",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  clientValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
  // RISK BADGE
  badgeLow:  { backgroundColor: "#D1FAE5", color: "#059669", padding: "2 6", borderRadius: 4, fontSize: 7, fontFamily: "Helvetica-Bold" },
  badgeMid:  { backgroundColor: "#E5E3DE", color: "#5C564E", padding: "2 6", borderRadius: 4, fontSize: 7, fontFamily: "Helvetica-Bold" },
  badgeHigh: { backgroundColor: "#FEE2E2", color: "#DC2626", padding: "2 6", borderRadius: 4, fontSize: 7, fontFamily: "Helvetica-Bold" },
  // SRI BAR
  sriTrack: {
    height: 6,
    backgroundColor: "#E0DBD3",
    borderRadius: 3,
    marginTop: 4,
    marginBottom: 2,
  },
  sriDefinition: {
    fontSize: 6,
    color: "#9C9488",
    marginTop: 6,
    lineHeight: 1.35,
    textAlign: "justify",
  },
  // DISCLAIMERS
  disclaimerBox: {
    backgroundColor: "#F5F4F0",
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    borderLeft: "3px solid #E0DBD3",
  },
  disclaimerTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#9C9488",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  disclaimerItem: {
    fontSize: 7,
    color: "#5C564E",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  // FOOTER
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #E0DBD3",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#9C9488",
  },
  // Cover page (financial report style)
  coverPage: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1A1714",
    backgroundColor: "#FFFFFF",
    padding: 48,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  coverAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "#5C564E",
  },
  coverLogo: {
    marginTop: 20,
    marginBottom: 28,
    width: 127,
    height: 54,
    objectFit: "contain",
  },
  coverBrand: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#9C9488",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 11,
    color: "#5C564E",
    letterSpacing: 0.5,
    marginBottom: 48,
  },
  coverDivider: {
    width: 80,
    height: 2,
    backgroundColor: "#5C564E",
    marginBottom: 32,
  },
  coverFieldLabel: {
    fontSize: 8,
    color: "#9C9488",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  coverFieldValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
    marginBottom: 20,
  },
  coverRef: {
    fontSize: 8,
    color: "#9C9488",
    marginTop: 24,
  },
  coverDisclaimerBlock: {
    marginTop: 6,
    marginBottom: 4,
  },
  coverDisclaimerTitle: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  coverDisclaimerText: {
    fontSize: 6,
    color: "#5C564E",
    lineHeight: 1.35,
    textAlign: "justify",
  },
  coverFooter: {
    fontSize: 7,
    color: "#9C9488",
    marginTop: 24,
    paddingTop: 24,
    borderTop: "1px solid #E0DBD3",
  },
});

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function riskBadgeStyle(band: string) {
  if (band === "GREEN" || band === "LOW") return S.badgeLow;
  if (band === "AMBER" || band === "MEDIUM") return S.badgeMid;
  return S.badgeHigh;
}

export function BtcPdfDocument({
  snapshot,
  client,
  logoSrc,
}: {
  snapshot: BtcScenarioSnapshot;
  client: ClientInfo;
  logoSrc?: string;
}) {
  const {
    inputs,
    results,
    yieldBoard,
    savedAt,
    selectedProviderName,
    selectedProviderApy,
    selectedProviderApyMin,
    selectedProviderApyMax,
    selectedProviderCriteria,
  } = snapshot;

  const hasVariableApy =
    selectedProviderApyMin != null &&
    selectedProviderApyMax != null &&
    selectedProviderApyMin !== selectedProviderApyMax;
  const baseInputs = {
    totalNeed12m: inputs.totalNeed12m,
    btcPrice: inputs.btcPrice,
    ltv: inputs.ltv / 100,
    liquidationLtv: inputs.liquidationLtv / 100,
    durationMonths: inputs.durationMonths,
  };
  const resultMin = hasVariableApy
    ? computeBtcPlanner({ ...baseInputs, apr: selectedProviderApyMin })
    : null;
  const resultMax = hasVariableApy
    ? computeBtcPlanner({ ...baseInputs, apr: selectedProviderApyMax })
    : null;

  const dateStr = new Date(savedAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
  const timeStr = new Date(savedAt).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit",
  });

  const bandLabel =
    results.riskBand === "GREEN" ? "LOW RISK" :
    results.riskBand === "AMBER" ? "MEDIUM RISK" : "HIGH RISK";

  const reportRef = savedAt.replace(/\D/g, "").slice(0, 14);

  return (
    <Document>
      {/* Page de garde */}
      <Page size="A4" style={S.coverPage}>
        <View style={S.coverAccentBar} />
        <View>
          {logoSrc ? <Image src={logoSrc} style={S.coverLogo} /> : null}
          <Text style={S.coverBrand}>Digital Credit Compass</Text>
          <Text style={S.coverTitle}>Risk Analysis Report</Text>
          <Text style={S.coverSubtitle}>BTC Income Planner</Text>
          <View style={S.coverDivider} />
          <Text style={S.coverFieldLabel}>Prepared for</Text>
          <Text style={S.coverFieldValue}>{client.clientName || "—"}</Text>
          <Text style={S.coverFieldLabel}>Report date</Text>
          <Text style={S.coverFieldValue}>{dateStr}</Text>
          <Text style={S.coverFieldLabel}>Reference</Text>
          <Text style={S.coverFieldValue}>DCC-{reportRef}</Text>
        </View>
        <View style={S.coverDisclaimerBlock}>
          <Text style={S.coverDisclaimerTitle}>IMPORTANT:</Text>
          <Text style={S.coverDisclaimerText}>
            This document is a scenario analysis output only. It does not constitute investment, financial, legal, or tax advice and is not a regulated suitability assessment under any applicable law. All figures, scores, projected income, liquidation prices, collateral calculations, and allocation outputs are illustrative only. The Reference Scenario is an engine-generated benchmark — it is not a personalised recommendation. You must construct your own scenario before making any investment decision. Consult a qualified licensed financial adviser.
          </Text>
        </View>
        <View style={S.coverDisclaimerBlock}>
          <Text style={S.coverDisclaimerTitle}>NO CONFLICTS OF INTEREST:</Text>
          <Text style={S.coverDisclaimerText}>
            DCC does not accept payment from any provider, issuer, or platform in connection with the production or modification of any score. No DCC score is influenced by commercial relationships or issuer-paid engagement. All scores are computed from publicly available information via a deterministic scoring engine. DCC holds no financial interest in any instrument, provider, or allocation shown in this document.
          </Text>
        </View>
        <View style={S.coverDisclaimerBlock}>
          <Text style={S.coverDisclaimerTitle}>REGULATORY STATUS:</Text>
          <Text style={S.coverDisclaimerText}>
            Digital Credit Compass is not authorised or regulated by the FCA (UK), SEC (USA), MAS (Singapore), ESMA (EU), VARA (UAE), or any other financial services regulatory body. This document has not been approved by an FCA-authorised person under s.21 FSMA 2000. It is not directed at retail clients in the United Kingdom. Recipients in regulated jurisdictions must seek independent legal and regulatory advice before acting on any information herein.
          </Text>
        </View>
        <Text style={S.coverFooter}>
          Confidential — For the addressee only. This report is for informational purposes and does not constitute investment advice. DCC v1.0 · Deterministic (Methodology v1.0) · Append-only versioning.
        </Text>
      </Page>

      <Page size="A4" style={S.page}>
        {/* ACCENT BAR */}
        <View style={S.headerBar} />

        {/* HEADER */}
        <View style={S.headerRow}>
          <View>
            <Text style={S.reportTitle}>Risk Analysis Report</Text>
            <Text style={S.reportSubtitle}>BTC Income Planner · DCC v1.0</Text>
          </View>
          <View>
            <Text style={S.reportMeta}>Generated: {dateStr} at {timeStr}</Text>
            <Text style={S.reportMeta}>Report ID: {savedAt.replace(/\D/g, "").slice(0, 14)}</Text>
            <Text style={S.reportMeta}>Engine: Deterministic (Methodology v1.0) · Append-only versioning</Text>
          </View>
        </View>

        {/* CLIENT */}
        <View style={S.clientCard}>
          <View style={S.clientField}>
            <Text style={S.clientLabel}>Client</Text>
            <Text style={S.clientValue}>{client.clientName}</Text>
          </View>
          <View style={S.clientField}>
            <Text style={S.clientLabel}>Risk Preference</Text>
            <Text style={S.clientValue}>{client.riskPreference}</Text>
          </View>
          <View style={S.clientField}>
            <Text style={S.clientLabel}>Module</Text>
            <Text style={S.clientValue}>BTC Lending</Text>
          </View>
          <View style={S.clientField}>
            <Text style={S.clientLabel}>Data as of</Text>
            <Text style={S.clientValue}>{dateStr}</Text>
          </View>
        </View>

        {/* INPUTS */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Scenario Inputs</Text>
          <View style={S.row2}>
            <View style={[S.statCell, { borderLeftColor: "#5C564E" }]}>
              <Text style={S.statLabel}>Total Need 12m</Text>
              <Text style={S.statValue}>{fmt(inputs.totalNeed12m)}</Text>
            </View>
            <View style={[S.statCell, { borderLeftColor: "#5C564E" }]}>
              <Text style={S.statLabel}>BTC Price</Text>
              <Text style={S.statValue}>{fmt(inputs.btcPrice)}</Text>
            </View>
            <View style={[S.statCell, { borderLeftColor: "#5C564E" }]}>
              <Text style={S.statLabel}>LTV</Text>
              <Text style={S.statValue}>{inputs.ltv}%</Text>
            </View>
            <View style={[S.statCell, { borderLeftColor: "#5C564E" }]}>
              <Text style={S.statLabel}>
                {selectedProviderName ? "APY (provider) / Duration" : "APR / Duration"}
              </Text>
              <Text style={S.statValue}>
                {selectedProviderName && selectedProviderApy != null
                  ? `${selectedProviderApy} / ${inputs.durationMonths}m`
                  : `${inputs.apr}% / ${inputs.durationMonths}m`}
              </Text>
              {selectedProviderName && (
                <Text style={S.statSub}>From {selectedProviderName}</Text>
              )}
            </View>
          </View>
        </View>

        {/* RESULTS */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>Computed Results</Text>
          <View style={S.row2}>
            <View style={S.statCell}>
              <Text style={S.statLabel}>BTC Required</Text>
              <Text style={S.statValue}>{results.btcRequired.toFixed(4)}</Text>
              <Text style={S.statSub}>≈ {fmt(results.collateralUSD)} collateral</Text>
            </View>
            <View style={S.statCell}>
              <Text style={S.statLabel}>Monthly Target</Text>
              <Text style={S.statValue}>{fmt(results.monthlyTarget)}</Text>
              <Text style={S.statSub}>Principal + interest / 12</Text>
            </View>
          </View>
          <View style={S.row2}>
            <View style={S.warnCell}>
              <Text style={S.statLabel}>Margin Call Price</Text>
              <Text style={S.warnValue}>{fmt(results.marginCallPrice)}</Text>
              <Text style={S.statSub}>Trigger @ 75% LTV</Text>
            </View>
            <View style={S.dangerCell}>
              <Text style={S.statLabel}>Liquidation Price</Text>
              <Text style={S.dangerValue}>{fmt(results.liquidationPrice)}</Text>
              <Text style={S.statSub}>Trigger @ {inputs.liquidationLtv}% LTV</Text>
            </View>
            <View style={[S.statCell, { borderLeftColor: "#5C564E" }]}>
              <Text style={S.statLabel}>Total Interest ({inputs.durationMonths}m)</Text>
              <Text style={S.statValue}>
                {resultMin && resultMax
                  ? `${fmt(resultMin.totalInterest)} – ${fmt(resultMax.totalInterest)}`
                  : fmt(results.totalInterest)}
              </Text>
              {hasVariableApy && (
                <Text style={S.statSub}>APY range {selectedProviderApyMin}% – {selectedProviderApyMax}%</Text>
              )}
            </View>
            <View style={S.statCell}>
              <Text style={S.statLabel}>Total Cost ({inputs.durationMonths}m)</Text>
              <Text style={S.statValue}>
                {resultMin && resultMax
                  ? `${fmt(resultMin.totalCost)} – ${fmt(resultMax.totalCost)}`
                  : fmt(results.totalCost)}
              </Text>
              {hasVariableApy && (
                <Text style={S.statSub}>Principal + total interest (range)</Text>
              )}
            </View>
          </View>

          {/* SRI */}
          <View style={{ backgroundColor: "#F5F4F0", borderRadius: 6, padding: 10, marginTop: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
              <Text style={{ fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#5C564E" }}>
                Scenario Risk Index (SRI)
              </Text>
              <Text style={riskBadgeStyle(results.riskBand)}>{bandLabel}</Text>
            </View>
            <View style={S.sriTrack}>
              <View style={{
                height: 6,
                width: `${results.sri}%`,
                backgroundColor:
                  results.riskBand === "GREEN" ? "#059669" :
                  results.riskBand === "AMBER" ? "#5C564E" : "#7F1D1D",
                borderRadius: 3,
              }} />
            </View>
            <Text style={{ fontSize: 8, color: "#9C9488" }}>
              SRI {results.sri.toFixed(1)} / 100 · LTV {inputs.ltv}% vs Liquidation {inputs.liquidationLtv}%
            </Text>
            <Text style={S.sriDefinition}>
              Definition: The SRI is a DCC proprietary composite metric combining the adjusted provider score, the user LTV relative to the provider liquidation threshold, and the duration multiplier. It reflects the structural risk of this specific scenario only — not a general credit assessment of the provider. Bands: 80–100 LOW  |  60–79 MEDIUM  |  40–59 ELEVATED  |  0–39 HIGH. The SRI is not a regulated credit rating and does not correspond to any external rating scale.
            </Text>
          </View>
        </View>

        {/* PROVIDER: only selected provider when one is chosen, otherwise full Yield Board */}
        {selectedProviderName ? (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Selected Provider — {selectedProviderName}</Text>
            <View style={{ backgroundColor: "#F5F4F0", borderRadius: 6, padding: 12, borderLeft: "4px solid #5C564E" }}>
              {(() => {
                const row = yieldBoard.find((p) => p.name === selectedProviderName);
                return (
                  <>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
                      {row && (
                        <>
                          <View>
                            <Text style={{ fontSize: 7, color: "#9C9488", textTransform: "uppercase", marginBottom: 2 }}>DCC Score (raw)</Text>
                            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1A1714" }}>{row.score}</Text>
                          </View>
                          <View>
                            <Text style={{ fontSize: 7, color: "#9C9488", textTransform: "uppercase", marginBottom: 2 }}>Adj. Score ×{row.multiplier?.toFixed(2) ?? "1.00"}</Text>
                            <Text style={{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#1A1714" }}>{row.adjustedScore}</Text>
                          </View>
                        </>
                      )}
                      <View>
                        <Text style={{ fontSize: 7, color: "#9C9488", textTransform: "uppercase", marginBottom: 2 }}>APY</Text>
                        <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1A1714" }}>
                          {selectedProviderApy ?? "—"}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 7, color: "#9C9488", textTransform: "uppercase", marginBottom: 2 }}>Collateral</Text>
<Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#1A1714" }}>
                  {fmt(results.collateralUSD)}
                        </Text>
                      </View>
                    </View>
                    {selectedProviderCriteria && Object.keys(selectedProviderCriteria).length > 0 && (
                      <View style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E0DBD3" }}>
                        <Text style={{ fontSize: 7, color: "#9C9488", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                          Criteria breakdown
                        </Text>
                        {[
                          { key: "transparency", label: "Transparency" },
                          { key: "collateralControl", label: "Collateral Control" },
                          { key: "jurisdiction", label: "Jurisdiction" },
                          { key: "structuralRisk", label: "Structural Risk" },
                          { key: "trackRecord", label: "Track Record" },
                        ].map(
                          ({ key, label }) =>
                            selectedProviderCriteria[key] != null && (
                              <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                                <Text style={{ fontSize: 8, color: "#5C564E", width: 100 }}>{label}</Text>
                                <View style={{ flex: 1, height: 6, backgroundColor: "#E0DBD3", borderRadius: 3, marginHorizontal: 8, overflow: "hidden" }}>
                                  <View
                                    style={{
                                      height: 6,
                                      width: `${selectedProviderCriteria[key]}%`,
                                      backgroundColor: "#5C564E",
                                      borderRadius: 3,
                                    }}
                                  />
                                </View>
                                <Text style={{ fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1A1714", width: 24, textAlign: "right" }}>
                                  {selectedProviderCriteria[key]}
                                </Text>
                              </View>
                            )
                        )}
                      </View>
                    )}
                  </>
                );
              })()}
            </View>
          </View>
        ) : (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Yield Board — DCC Scores (Duration-Adjusted)</Text>
            <View style={S.table}>
              <View style={S.tableHeader}>
                <Text style={[S.th, { flex: 2 }]}>Provider</Text>
                <Text style={[S.th, { flex: 1 }]}>Raw Score</Text>
                <Text style={[S.th, { flex: 1 }]}>Adj. Score ×{yieldBoard[0]?.multiplier.toFixed(2)}</Text>
                <Text style={[S.th, { flex: 1 }]}>APY Range</Text>
              </View>
              {yieldBoard.map((p, i) => (
                <View key={i} style={i % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                  <Text style={[S.td, { flex: 2 }]}>{p.name}</Text>
                  <Text style={[S.tdMono, { flex: 1 }]}>{p.score}</Text>
                  <Text style={[S.tdOrange, { flex: 1 }]}>{p.adjustedScore}</Text>
                  <Text style={[S.tdGreen, { flex: 1 }]}>{p.apy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* DISCLAIMERS */}
        <View style={S.disclaimerBox}>
          <Text style={S.disclaimerTitle}>L E G A L   D I S C L A I M E R S</Text>
          {DISCLAIMERS.map((d, i) => (
            <Text key={i} style={S.disclaimerItem}>{i + 1}. {d}</Text>
          ))}
        </View>

        {/* FOOTER */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>DCC v1.0 · BTC Income Planner · Scenario Output · Not a regulated suitability assessment</Text>
          <Text style={S.footerText}>Data as of {dateStr} · Scores frozen at generation time</Text>
        </View>
      </Page>
    </Document>
  );
}

// Fonction principale exportée — génère et télécharge le PDF
export async function generateAndDownloadBtcPdf(
  snapshot: BtcScenarioSnapshot,
  client: ClientInfo
) {
  const blob = await pdf(
    <BtcPdfDocument snapshot={snapshot} client={client} logoSrc="/logo-dcc-pdf-cover.png" />
  ).toBlob();

  const clientSlug = client.clientName.replace(/\s+/g, "_").toLowerCase();
  const dateSlug   = new Date().toISOString().slice(0, 10);
  const filename   = `DCC_Report_1A_BTC_${clientSlug}_${dateSlug}.pdf`;

  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
