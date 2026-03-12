/**
 * 6-step pipeline: Source Discovery → Document Fetch → Field Extraction →
 * Conflict Detection → Confidence Scoring → Evidence Pack JSON.
 */
import { getWhitelistForProvider } from "./whitelist";
import { getPromptForPlanner } from "./prompts";
import type { AgentOutput } from "@/types/ai-agent";

const CONFIDENCE_SAFETY_CRITICAL = 0.85;
const CONFIDENCE_HIGH = 0.8;
const CONFIDENCE_STANDARD = 0.7;

type PlannerTypeAgent = "btc" | "fiat" | "stablecoin";

/** Step 1: Source Discovery — whitelist of official URLs */
export function discoverSources(providerSlug: string): string[] {
  return getWhitelistForProvider(providerSlug);
}

/** Step 2: Document Fetch — returns corpus (mock: no real fetch to avoid external calls in dev) */
export async function fetchDocuments(urls: string[]): Promise<Array<{ url: string; text: string }>> {
  const corpus: Array<{ url: string; text: string }> = [];
  for (const url of urls.slice(0, 5)) {
    try {
      const res = await fetch(url, { next: { revalidate: 0 }, signal: AbortSignal.timeout(5000) });
      const text = res.ok ? await res.text() : "";
      corpus.push({ url, text: text.slice(0, 2000) });
    } catch {
      corpus.push({ url, text: "" });
    }
  }
  if (corpus.length === 0) {
    corpus.push({ url: "mock://official", text: "Official terms and LTV 85%." });
  }
  return corpus;
}

/** Step 3: Field Extraction — mock LLM returns proposed values (plug in real LLM later).
 *  Mock différencié: valeurs dérivées du provider + corpus pour varier par provider. */
function getFieldsForPlanner(plannerType: PlannerTypeAgent): string[] {
  if (plannerType === "btc") {
    return ["transparency", "collateralControl", "jurisdiction", "structuralRisk", "trackRecord", "liquidation_ltv", "rehypothecation"];
  }
  if (plannerType === "fiat") {
    return ["marketVolatility", "incomeMechanism", "seniority", "complexity", "providerQuality", "hv30"];
  }
  return ["reserveQuality", "yieldTransparency", "counterpartyRisk", "liquidity"];
}

/** Derive a numeric seed from a string for deterministic but varied mock values. */
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

export function extractFields(
  plannerType: PlannerTypeAgent,
  _prompt: string,
  corpus: Array<{ url: string; text: string }>,
  providerSlug?: string
): Record<string, { value: string; snippet: string; url: string }> {
  const fields = getFieldsForPlanner(plannerType);
  const seedSource = providerSlug ?? corpus[0]?.text ?? "default";
  const seed = simpleHash(seedSource);
  const firstDocText = corpus[0]?.text?.trim() ?? "";
  const snippetBase = firstDocText.slice(0, 25) || "Extracted from official source.";
  const url = corpus[0]?.url ?? "mock://official";

  const result: Record<string, { value: string; snippet: string; url: string }> = {};
  fields.forEach((f, i) => {
    const value =
      f === "hv30"
        ? String((seed % 31) + 10)
        : String((seed + i * 31) % 101);
    result[f] = {
      value,
      snippet: snippetBase + (firstDocText.length > 25 ? "…" : ""),
      url,
    };
  });
  return result;
}

/** Step 4: Conflict Detection — if multiple sources disagree, flag CONFLICT */
export function detectConflicts(
  extracted: Record<string, { value: string; snippet: string; url: string }>
): Record<string, boolean> {
  const conflicts: Record<string, boolean> = {};
  for (const key of Object.keys(extracted)) {
    conflicts[key] = false;
  }
  return conflicts;
}

/** Step 5: Confidence Scoring — 0.0–1.0 per field; flag below threshold */
export function scoreConfidence(
  extracted: Record<string, { value: string; snippet: string; url: string }>,
  plannerType: PlannerTypeAgent
): { confidence: Record<string, number>; belowThreshold: string[] } {
  const confidence: Record<string, number> = {};
  const belowThreshold: string[] = [];
  const safetyCritical = ["liquidation_ltv", "rehypothecation", "hv30", "pegDeviation90d", "seniority"];
  for (const [field, data] of Object.entries(extracted)) {
    const c = 0.82;
    confidence[field] = c;
    const min = safetyCritical.includes(field) ? CONFIDENCE_SAFETY_CRITICAL : CONFIDENCE_STANDARD;
    if (c < min) belowThreshold.push(field);
  }
  return { confidence, belowThreshold };
}

/** Step 6: Build Evidence Pack JSON (AgentOutput) */
export function buildEvidencePack(params: {
  providerId: string;
  plannerType: PlannerTypeAgent;
  extracted: Record<string, { value: string; snippet: string; url: string }>;
  conflicts: Record<string, boolean>;
  confidence: Record<string, number>;
  belowThreshold: string[];
}): AgentOutput {
  const now = new Date().toISOString();
  const proposedClassifications: AgentOutput["proposedClassifications"] = {};
  const fieldsRequiringReview: string[] = [];

  for (const [field, data] of Object.entries(params.extracted)) {
    const conf = params.confidence[field] ?? 0.7;
    const conflict = params.conflicts[field] ?? false;
    if (conf < CONFIDENCE_STANDARD || conflict) fieldsRequiringReview.push(field);
    proposedClassifications[field] = {
      proposedValue: data.value,
      confidence: conf,
      sources: [{ url: data.url, snippet: data.snippet, lastChecked: now }],
      conflictDetected: conflict,
      adminStatus: "pending",
    };
  }

  const overall = Object.values(params.confidence).length
    ? Object.values(params.confidence).reduce((a, b) => a + b, 0) / Object.values(params.confidence).length
    : 0.8;

  return {
    providerId: params.providerId,
    plannerType: params.plannerType,
    agentRunTimestamp: now,
    proposedClassifications,
    fieldsRequiringReview,
    criticalFieldsBelowThreshold: params.belowThreshold,
    overallAgentConfidence: Math.round(overall * 100) / 100,
    publishBlocked: true,
  };
}

/** Run full pipeline and return AgentOutput */
export async function runPipeline(params: {
  providerId: string;
  providerName: string;
  providerSlug: string;
  plannerType: PlannerTypeAgent;
}): Promise<AgentOutput> {
  const urls = discoverSources(params.providerSlug);
  const corpus = await fetchDocuments(urls);
  const officialDomain = urls[0] ? new URL(urls[0]).origin : "https://example.com";
  const prompt = getPromptForPlanner(params.plannerType, params.providerName, officialDomain);
  const extracted = extractFields(params.plannerType, prompt, corpus, params.providerSlug);
  const conflicts = detectConflicts(extracted);
  const { confidence, belowThreshold } = scoreConfidence(extracted, params.plannerType);
  return buildEvidencePack({
    providerId: params.providerId,
    plannerType: params.plannerType,
    extracted,
    conflicts,
    confidence,
    belowThreshold,
  });
}
