import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const ACCENT = "#1A1714";

export type SnapshotAllocationItem = {
  providerId: string;
  providerName: string;
  ticker?: string;
  weightPct: number;
  apyMin: number;
  apyMax: number;
  dccScore: number;
  riskBand: string;
  keyRiskNote?: string;
};

export type SnapshotOutputs = {
  portfolioScore?: number;
  portfolioBand?: string;
  blendedApyMin?: number;
  blendedApyMax?: number;
  annualIncomeMin?: number;
  annualIncomeMax?: number;
  monthlyIncomeMin?: number;
  monthlyIncomeMax?: number;
  totalWeight?: number;
  isValid?: boolean;
};

const styles = StyleSheet.create({
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
    backgroundColor: ACCENT,
  },
  coverLogo: {
    width: 127,
    height: 54,
    marginBottom: 24,
    objectFit: "contain",
  },
  coverBrand: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#9C9488",
    textTransform: "uppercase",
    marginTop: 32,
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
    backgroundColor: ACCENT,
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
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1A1714",
    backgroundColor: "#FFFFFF",
    padding: 40,
  },
  contentAccentBar: {
    backgroundColor: ACCENT,
    height: 4,
    marginBottom: 24,
    borderRadius: 2,
  },
  contentTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
    marginBottom: 6,
  },
  contentSubtitle: {
    fontSize: 8,
    color: "#9C9488",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 28,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9C9488",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: "1px solid #E0DBD3",
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    color: "#9C9488",
    width: 120,
  },
  value: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0DBD3",
    paddingBottom: 6,
    marginBottom: 6,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#9C9488",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E8E4DE",
    fontSize: 9,
  },
  colProvider: { width: "28%" },
  colWeight: { width: "12%", textAlign: "right" },
  colApy: { width: "18%", textAlign: "right" },
  colScore: { width: "12%", textAlign: "right" },
  colBand: { width: "15%" },
  colNote: { width: "15%", fontSize: 7, color: "#5C564E" },
  moduleLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#5C564E",
    marginTop: 12,
    marginBottom: 4,
  },
  disclaimer: {
    fontSize: 7,
    color: "#5C564E",
    lineHeight: 1.5,
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1px solid #E0DBD3",
  },
  disclaimerItem: {
    marginBottom: 8,
    fontSize: 7,
    color: "#5C564E",
    lineHeight: 1.4,
  },
  riskNoteItem: {
    marginBottom: 6,
    fontSize: 8,
    color: "#1A1714",
    lineHeight: 1.4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#E0DBD3",
  },
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 12,
  },
  statBox: {
    width: "30%",
    minWidth: 100,
    padding: 10,
    backgroundColor: "#F8F6F3",
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 7,
    color: "#9C9488",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1A1714",
  },
});

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
function formatApy(min: number, max: number): string {
  return `${(min * 100).toFixed(1)}–${(max * 100).toFixed(1)}%`;
}

export function SuitabilityPDF({
  clientName,
  dccVersion,
  generatedAt,
  reportId,
  dataAsOf,
  riskPreference,
  plannerModule,
  inputs,
  allocation,
  outputs,
  riskNotes,
  disclaimers,
  logoSrc,
}: {
  clientName?: string | null;
  dccVersion?: string;
  generatedAt?: Date;
  reportId?: string;
  dataAsOf?: Date;
  riskPreference?: string | null;
  plannerModule?: string;
  inputs?: Record<string, unknown>;
  allocation?: SnapshotAllocationItem[];
  outputs?: SnapshotOutputs;
  riskNotes?: string[];
  disclaimers?: string[];
  /** Absolute path to logo image or { data: base64, format: 'PNG' } for cover page */
  logoSrc?: string | { data: string; format: string };
}) {
  const dateStr =
    generatedAt != null
      ? new Date(generatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  const dataAsOfStr =
    dataAsOf != null
      ? new Date(dataAsOf).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  const refDisplay = reportId ? `DCC-${reportId.slice(0, 8)}` : "—";

  const allocationList = Array.isArray(allocation) ? allocation : [];
  const hasPortfolio = allocationList.length > 0 && outputs != null;
  const DEFAULT_DISCLAIMERS = [
    "This document is a scenario analysis output produced by DCC's deterministic scoring engine for informational purposes only. It does not constitute investment, financial, legal, or tax advice. It is not a regulated suitability assessment under any applicable financial services law. DCC is not a licensed investment adviser, financial adviser, broker-dealer, or credit rating agency in any jurisdiction. No fiduciary duty is created by the production or delivery of this document. This document must not be relied upon as the sole basis for any investment decision.",
    "DCC scores are computed solely from publicly available information as of the date shown. They do not incorporate private issuer disclosures, audited financial data, or undisclosed material information. Where data gaps exist, scores reflect available evidence only; the absence of information may itself indicate a risk factor. Scores are not predictions of future performance, creditworthiness, or default probability.",
    "All scenario outputs — including yield estimates, income projections, BTC collateral requirements, liquidation price thresholds, margin call trigger prices, LTV calculations, interest computations, Scenario Risk Index (SRI) values, Reference Scenario allocation weights, and blended APY figures — are illustrative and scenario-specific. They are computed from user-supplied inputs and DCC scoring data as of the date shown. Actual outcomes may differ materially. These figures do not constitute a guarantee, warranty, or representation as to actual outcomes.",
    "Digital Credit Compass is not a registered investment adviser, broker-dealer, or financial institution.",
    "Past performance is not a reliable indicator of future results. Past DCC scores, provider track records, yield histories, and prior methodology versions do not guarantee, predict, or suggest future scoring outcomes, yields, or investment performance.",
    "Users are solely responsible for their own investment decisions. DCC's liability, where permitted by applicable law, is limited to direct losses caused solely by a material error in the DCC scoring engine demonstrably attributable to DCC. DCC shall not be liable for indirect, consequential, speculative, or punitive losses. Nothing in this document limits any statutory rights you may have under applicable consumer protection or financial services law that cannot be excluded by agreement.",
    "This report does not constitute a solicitation or offer to buy or sell any financial instrument or product.",
  ];
  const disclaimerList = Array.isArray(disclaimers) && disclaimers.length > 0 ? disclaimers : DEFAULT_DISCLAIMERS;
  const riskNotesList = Array.isArray(riskNotes) ? riskNotes : [];

  const capitalUSD = typeof inputs?.capitalUSD === "number" ? inputs.capitalUSD : 0;

  const logoSource =
    typeof logoSrc === "string"
      ? logoSrc
      : logoSrc?.data != null && logoSrc?.format != null
        ? `data:image/${logoSrc.format.toLowerCase()};base64,${logoSrc.data}`
        : undefined;

  return (
    <Document>
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverAccentBar} />
        <View>
          {logoSource ? (
            <Image src={logoSource} style={styles.coverLogo} />
          ) : null}
          <Text style={styles.coverBrand}>Digital Credit Compass</Text>
          <Text style={styles.coverTitle}>Risk Analysis Report</Text>
          <Text style={styles.coverSubtitle}>
            {hasPortfolio ? "Portfolio Summary" : "Risk Analysis"} · DCC v{dccVersion ?? "1.0"}
          </Text>
          <View style={styles.coverDivider} />
          <Text style={styles.coverFieldLabel}>Prepared for</Text>
          <Text style={styles.coverFieldValue}>{clientName ?? "—"}</Text>
          {riskPreference ? (
            <>
              <Text style={styles.coverFieldLabel}>Risk preference</Text>
              <Text style={styles.coverFieldValue}>{riskPreference}</Text>
            </>
          ) : null}
          <Text style={styles.coverFieldLabel}>Report date</Text>
          <Text style={styles.coverFieldValue}>{dateStr}</Text>
          <Text style={styles.coverFieldLabel}>Reference</Text>
          <Text style={styles.coverFieldValue}>{refDisplay}</Text>
        </View>
        <View style={styles.coverDisclaimerBlock}>
          <Text style={styles.coverDisclaimerTitle}>IMPORTANT:</Text>
          <Text style={styles.coverDisclaimerText}>
            This document is a scenario analysis output only. It does not constitute investment, financial, legal, or tax advice and is not a regulated suitability assessment under any applicable law. All figures, scores, projected income, liquidation prices, collateral calculations, and allocation outputs are illustrative only. The Reference Scenario is an engine-generated benchmark — it is not a personalised recommendation. You must construct your own scenario before making any investment decision. Consult a qualified licensed financial adviser.
          </Text>
        </View>
        <View style={styles.coverDisclaimerBlock}>
          <Text style={styles.coverDisclaimerTitle}>NO CONFLICTS OF INTEREST:</Text>
          <Text style={styles.coverDisclaimerText}>
            DCC does not accept payment from any provider, issuer, or platform in connection with the production or modification of any score. No DCC score is influenced by commercial relationships or issuer-paid engagement. All scores are computed from publicly available information via a deterministic scoring engine. DCC holds no financial interest in any instrument, provider, or allocation shown in this document.
          </Text>
        </View>
        <View style={styles.coverDisclaimerBlock}>
          <Text style={styles.coverDisclaimerTitle}>REGULATORY STATUS:</Text>
          <Text style={styles.coverDisclaimerText}>
            Digital Credit Compass is not authorised or regulated by the FCA (UK), SEC (USA), MAS (Singapore), ESMA (EU), VARA (UAE), or any other financial services regulatory body. This document has not been approved by an FCA-authorised person under s.21 FSMA 2000. It is not directed at retail clients in the United Kingdom. Recipients in regulated jurisdictions must seek independent legal and regulatory advice before acting on any information herein.
          </Text>
        </View>
        <Text style={styles.coverFooter}>
          Confidential — For the addressee only. This report is for informational
          purposes and does not constitute investment advice. DCC · Deterministic (Methodology v1.0) · Append-only versioning.
        </Text>
      </Page>

      {/* Page 2: Identification + Inputs + (optional) Portfolio outputs summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentAccentBar} />
        <Text style={styles.contentTitle}>Report Details</Text>
        <Text style={styles.contentSubtitle}>Risk Analysis · DCC engine</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Client</Text>
            <Text style={styles.value}>{clientName ?? "—"}</Text>
          </View>
          {riskPreference ? (
            <View style={styles.row}>
              <Text style={styles.label}>Risk preference</Text>
              <Text style={styles.value}>{riskPreference}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Version</Text>
            <Text style={styles.value}>DCC {dccVersion ?? "1.0"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated</Text>
            <Text style={styles.value}>{dateStr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data as of</Text>
            <Text style={styles.value}>{dataAsOfStr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Reference</Text>
            <Text style={styles.value}>{refDisplay}</Text>
          </View>
          {plannerModule ? (
            <View style={styles.row}>
              <Text style={styles.label}>Modules</Text>
              <Text style={styles.value}>{plannerModule}</Text>
            </View>
          ) : null}
        </View>

        {inputs && (inputs.capitalUSD != null || inputs.durationMonths != null) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inputs</Text>
            {typeof inputs.capitalUSD === "number" && (
              <View style={styles.row}>
                <Text style={styles.label}>Capital (USD)</Text>
                <Text style={styles.value}>
                  ${Number(inputs.capitalUSD).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </Text>
              </View>
            )}
            {inputs.durationMonths != null && (
              <View style={styles.row}>
                <Text style={styles.label}>Duration (months)</Text>
                <Text style={styles.value}>{String(inputs.durationMonths)}</Text>
              </View>
            )}
          </View>
        )}

        {hasPortfolio && outputs && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Portfolio Summary</Text>
            <View style={styles.statsGrid}>
              {outputs.portfolioScore != null && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Portfolio Score</Text>
                  <Text style={styles.statValue}>{Number(outputs.portfolioScore).toFixed(1)}</Text>
                </View>
              )}
              {(outputs.blendedApyMin != null || outputs.blendedApyMax != null) && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Blended APY</Text>
                  <Text style={styles.statValue}>
                    {outputs.blendedApyMin != null && outputs.blendedApyMax != null
                      ? `${Number(outputs.blendedApyMin).toFixed(1)}% – ${Number(outputs.blendedApyMax).toFixed(1)}%`
                      : "—"}
                  </Text>
                </View>
              )}
              {outputs.portfolioBand && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Risk Band</Text>
                  <Text style={styles.statValue}>{outputs.portfolioBand}</Text>
                </View>
              )}
              {(outputs.annualIncomeMin != null || outputs.annualIncomeMax != null) && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Annual Income (est. USD)</Text>
                  <Text style={styles.statValue}>
                    ${Math.round((Number(outputs.annualIncomeMin ?? 0) + Number(outputs.annualIncomeMax ?? 0)) / 2).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </Text>
                  <Text style={{ fontSize: 7, color: "#9C9488", marginTop: 2 }}>
                    {Math.round(Number(outputs.annualIncomeMin ?? 0)).toLocaleString("en-US")} – {Math.round(Number(outputs.annualIncomeMax ?? 0)).toLocaleString("en-US")}
                  </Text>
                </View>
              )}
              {(outputs.monthlyIncomeMin != null || outputs.monthlyIncomeMax != null) && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Monthly Income (est. USD)</Text>
                  <Text style={styles.statValue}>
                    ${Math.round((Number(outputs.monthlyIncomeMin ?? 0) + Number(outputs.monthlyIncomeMax ?? 0)) / 2).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                  </Text>
                </View>
              )}
              {outputs.totalWeight != null && (
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Total weight</Text>
                  <Text style={styles.statValue}>{Number(outputs.totalWeight).toFixed(1)}%</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Digital Credit Compass · Risk Analysis Report</Text>
          <Text style={styles.footerText}>{refDisplay} · {dateStr}</Text>
        </View>
      </Page>

      {/* Page 3: Allocation table (if portfolio) */}
      {hasPortfolio && allocationList.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.contentAccentBar} />
          <Text style={styles.contentTitle}>Portfolio Allocation</Text>
          <Text style={styles.contentSubtitle}>
            Capital: ${capitalUSD.toLocaleString("en-US", { maximumFractionDigits: 0 })} · Data as of {dataAsOfStr}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colProvider}>Provider</Text>
              <Text style={styles.colWeight}>Weight</Text>
              <Text style={styles.colApy}>APY range</Text>
              <Text style={styles.colScore}>DCC</Text>
              <Text style={styles.colBand}>Risk band</Text>
              <Text style={styles.colNote}>Note</Text>
            </View>
            {allocationList.map((row, i) => (
              <View key={row.providerId + i} style={styles.tableRow}>
                <Text style={styles.colProvider}>{row.providerName}</Text>
                <Text style={styles.colWeight}>{formatPct(row.weightPct)}</Text>
                <Text style={styles.colApy}>{formatApy(row.apyMin, row.apyMax)}</Text>
                <Text style={styles.colScore}>{row.dccScore}</Text>
                <Text style={styles.colBand}>{row.riskBand}</Text>
                <Text style={styles.colNote}>{row.keyRiskNote ?? "—"}</Text>
              </View>
            ))}
          </View>

          {riskNotesList.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk notes</Text>
              {riskNotesList.map((note, i) => (
                <Text key={i} style={styles.riskNoteItem}>{note}</Text>
              ))}
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Digital Credit Compass · Risk Analysis Report</Text>
            <Text style={styles.footerText}>{refDisplay} · {dateStr}</Text>
          </View>
        </Page>
      )}

      {/* Page 4 (or 3 if no allocation): Legal disclaimers */}
      <Page size="A4" style={styles.page}>
        <View style={styles.contentAccentBar} />
        <Text style={styles.contentTitle}>L E G A L   D I S C L A I M E R S</Text>
        <Text style={styles.contentSubtitle}>DCC Risk Analysis Report</Text>

        <View style={styles.section}>
          {disclaimerList.map((d, i) => (
            <Text key={i} style={styles.disclaimerItem}>{i + 1}. {d}</Text>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Digital Credit Compass · Risk Analysis Report</Text>
          <Text style={styles.footerText}>{refDisplay} · {dateStr}</Text>
        </View>
      </Page>
    </Document>
  );
}
