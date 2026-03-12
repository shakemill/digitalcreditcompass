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
