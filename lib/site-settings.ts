import { db } from "@/lib/prisma";

const KEY_COMING_SOON = "coming_soon_enabled";

export async function getComingSoonEnabled(): Promise<boolean> {
  const row = await db.siteSetting.findUnique({
    where: { key: KEY_COMING_SOON },
  });
  return row?.value === "true";
}

export async function setComingSoonEnabled(enabled: boolean): Promise<void> {
  await db.siteSetting.upsert({
    where: { key: KEY_COMING_SOON },
    create: { key: KEY_COMING_SOON, value: enabled ? "true" : "false" },
    update: { value: enabled ? "true" : "false" },
  });
}

// ── Landing SEO (title, description, keywords; English) ───────────────────
const KEY_SEO_TITLE = "seo_title";
const KEY_SEO_DESCRIPTION = "seo_description";
const KEY_SEO_KEYWORDS = "seo_keywords";
const KEY_SEO_OG_TITLE = "seo_og_title";
const KEY_SEO_OG_DESCRIPTION = "seo_og_description";

const DEFAULT_SEO = {
  title: "Digital Credit Compass | Clarity Before Yield — Bitcoin & Stablecoin Income Planning",
  description:
    "Plan Bitcoin-backed and stablecoin income with transparent risk. Digital Credit Compass (DCC) lets you simulate yield, stress-test scenarios, compare strategies, and generate reports—without selling your Bitcoin.",
  keywords: [
    "Bitcoin yield planning",
    "stablecoin income",
    "digital credit compass",
    "Clarity Before Yield",
    "yield intelligence",
    "risk analysis",
    "income scenarios",
    "crypto lending",
  ],
  ogTitle: "Digital Credit Compass | Clarity Before Yield",
  ogDescription:
    "Plan Bitcoin-backed and stablecoin income with transparent risk. Simulate, compare, and report—without selling your Bitcoin.",
};

export type LandingSEOSettings = typeof DEFAULT_SEO;

export async function getLandingSEOSettings(): Promise<LandingSEOSettings> {
  const rows = await db.siteSetting.findMany({
    where: {
      key: {
        in: [KEY_SEO_TITLE, KEY_SEO_DESCRIPTION, KEY_SEO_KEYWORDS, KEY_SEO_OG_TITLE, KEY_SEO_OG_DESCRIPTION],
      },
    },
  });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  let keywords: string[] = DEFAULT_SEO.keywords;
  try {
    if (byKey[KEY_SEO_KEYWORDS]) {
      const parsed = JSON.parse(byKey[KEY_SEO_KEYWORDS]) as unknown;
      keywords = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : DEFAULT_SEO.keywords;
    }
  } catch {
    // keep default
  }
  return {
    title: byKey[KEY_SEO_TITLE] ?? DEFAULT_SEO.title,
    description: byKey[KEY_SEO_DESCRIPTION] ?? DEFAULT_SEO.description,
    keywords,
    ogTitle: byKey[KEY_SEO_OG_TITLE] ?? DEFAULT_SEO.ogTitle,
    ogDescription: byKey[KEY_SEO_OG_DESCRIPTION] ?? DEFAULT_SEO.ogDescription,
  };
}

export async function setLandingSEOSettings(settings: Partial<LandingSEOSettings>): Promise<void> {
  const updates: { key: string; value: string }[] = [];
  if (settings.title != null) updates.push({ key: KEY_SEO_TITLE, value: settings.title.slice(0, 200) });
  if (settings.description != null) updates.push({ key: KEY_SEO_DESCRIPTION, value: settings.description.slice(0, 500) });
  if (settings.keywords != null) updates.push({ key: KEY_SEO_KEYWORDS, value: JSON.stringify(settings.keywords) });
  if (settings.ogTitle != null) updates.push({ key: KEY_SEO_OG_TITLE, value: settings.ogTitle.slice(0, 200) });
  if (settings.ogDescription != null) updates.push({ key: KEY_SEO_OG_DESCRIPTION, value: settings.ogDescription.slice(0, 500) });
  for (const { key, value } of updates) {
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
