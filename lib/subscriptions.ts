import { db } from "@/lib/prisma";

type UpsertSubscriptionArgs = {
  userId: string;
  provider: string;
  providerSubscriptionId?: string | null;
  whopMembershipId?: string | null;
  whopUserId?: string | null;
  plan: string; // internal plan code, e.g. "pro_monthly" | "pro_annual"
  status: string;
  currentPeriodEnd: Date | null;
};

async function resolvePlanId(planCode: string): Promise<string | null> {
  // For now we assume a single "pro" plan in the Plan table as in the existing Stripe webhook.
  const plan = await db.plan.findUnique({ where: { slug: "pro" } });
  return plan?.id ?? null;
}

/**
 * Provider-agnostic check: returns true if the user has any active subscription
 * (Stripe or Whop) with currentPeriodEnd in the future (or null, treated as active).
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await db.subscription.findUnique({
    where: { userId },
    select: { status: true, currentPeriodEnd: true },
  });
  if (!sub) return false;
  if (sub.status !== "active") return false;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date()) return false;
  return true;
}

export async function upsertSubscription(args: UpsertSubscriptionArgs): Promise<void> {
  const planId = await resolvePlanId(args.plan);
  if (!planId) {
    // If the Plan row is missing, we log and skip to avoid throwing inside webhooks.
    console.warn("[subscriptions] Plan 'pro' not found; skipping upsertSubscription for user", args.userId);
    return;
  }

  await db.subscription.upsert({
    where: { userId: args.userId },
    create: {
      userId: args.userId,
      planId,
      provider: args.provider,
      providerSubscriptionId: args.providerSubscriptionId ?? null,
      whopMembershipId: args.whopMembershipId ?? null,
      whopUserId: args.whopUserId ?? null,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
    },
    update: {
      provider: args.provider,
      providerSubscriptionId: args.providerSubscriptionId ?? null,
      whopMembershipId: args.whopMembershipId ?? null,
      whopUserId: args.whopUserId ?? null,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      planId,
    },
  });
}

