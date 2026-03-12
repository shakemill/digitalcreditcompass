import type { PlannerType, JurisdictionTier, ReyhypType } from "@prisma/client";

export type ProviderType = {
  id: string;
  name: string;
  slug: string;
  plannerType: PlannerType;
  domicile: string;
  jurisdictionTier: JurisdictionTier;
  isActive: boolean;
  apyMin: number | null;
  apyMax: number | null;
  maxLtv: number | null;
  liquidationLtv: number | null;
  rehypothecation: ReyhypType;
  createdAt: Date;
  updatedAt: Date;
};
