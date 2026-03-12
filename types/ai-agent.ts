/** Agent output contract — Section 4.4 */

export interface AgentOutput {
  providerId: string;
  plannerType: "btc" | "stablecoin" | "fiat";
  agentRunTimestamp: string;
  marketData?: {
    hv30?: number;
    maxDrawdown90d?: number;
    pegDeviation90d?: number;
    tvl?: number;
    source: string;
    lastFetched: string;
    requiresAdminReview: false;
  };
  proposedClassifications: Record<
    string,
    {
      proposedValue: string;
      confidence: number;
      sources: Array<{ url: string; snippet: string; lastChecked: string }>;
      conflictDetected: boolean;
      adminStatus: "pending" | "approved" | "edited" | "rejected";
    }
  >;
  fieldsRequiringReview: string[];
  criticalFieldsBelowThreshold: string[];
  overallAgentConfidence: number;
  publishBlocked: true;
}

export type PlannerTypeAgent = "btc" | "stablecoin" | "fiat";
