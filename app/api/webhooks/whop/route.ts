import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/prisma";
import { upsertSubscription } from "@/lib/subscriptions";
import { sendProWelcomeEmail } from "@/lib/email/sendEmail";

function verifyWhopSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

function mapWhopPlanToInternal(planId: string | null | undefined): string | null {
  if (!planId) return null;
  if (planId === process.env.WHOP_PRO_MONTHLY_PLAN_ID) return "pro_monthly";
  if (planId === process.env.WHOP_PRO_ANNUAL_PLAN_ID) return "pro_annual";
  return null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-whop-signature");

  if (!verifyWhopSignature(rawBody, signature)) {
    console.error("[Whop webhook] Invalid signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    console.error("[Whop webhook] Invalid JSON payload");
    return NextResponse.json({ received: true });
  }

  const action = event?.action as string | undefined;
  const data = event?.data as any;
  const membershipId = data?.id as string | undefined;
  const userId = data?.user_id as string | undefined;
  const planId = data?.plan_id as string | undefined;

  console.log("[Whop webhook]", action, {
    membershipId: membershipId ?? null,
    userId: userId ?? null,
    planId: planId ?? null,
  });

  try {
    if (action === "membership.went_valid") {
      const internalPlan = mapWhopPlanToInternal(planId);

      const renewalEndTs = data?.renewal_period_end as number | undefined | null;
      const periodEnd =
        typeof renewalEndTs === "number" && renewalEndTs > 0
          ? new Date(renewalEndTs * 1000)
          : null;

      if (!internalPlan) {
        console.warn("[Whop webhook] Unknown plan_id:", planId);
        if (membershipId && userId) {
          await db.pendingWhopSubscription.upsert({
            where: { whopMembershipId: membershipId },
            create: {
              whopMembershipId: membershipId,
              whopUserId: userId,
              plan: planId ?? "unknown",
              periodEnd,
            },
            update: {
              plan: planId ?? "unknown",
              status: "active",
              periodEnd,
            },
          });
          console.log("[Whop webhook] Stored pending subscription for whop_user:", userId);
        }
        return NextResponse.json({ received: true });
      }

      if (!userId || !membershipId) {
        console.warn("[Whop webhook] membership.went_valid missing userId or membershipId");
        return NextResponse.json({ received: true });
      }

      const dccUser = await db.user.findFirst({
        where: { whopUserId: userId },
        select: { id: true },
      });

      if (!dccUser) {
        await db.pendingWhopSubscription.upsert({
          where: { whopMembershipId: membershipId },
          create: {
            whopMembershipId: membershipId,
            whopUserId: userId,
            plan: internalPlan,
            periodEnd,
          },
          update: {
            plan: internalPlan,
            status: "active",
            periodEnd,
          },
        });
        console.log("[Whop webhook] Stored pending subscription for whop_user (no DCC user yet):", userId);
        return NextResponse.json({ received: true });
      }

      const periodStart = (() => {
        if (!periodEnd) return new Date();
        const d = new Date(periodEnd.getTime());
        if (internalPlan === "pro_annual") d.setFullYear(d.getFullYear() - 1);
        else d.setMonth(d.getMonth() - 1);
        return d;
      })();

      await upsertSubscription({
        userId: dccUser.id,
        provider: "whop",
        providerSubscriptionId: membershipId,
        whopMembershipId: membershipId,
        whopUserId: userId,
        plan: internalPlan,
        status: "active",
        currentPeriodEnd: periodEnd,
      });

      await db.user.update({
        where: { id: dccUser.id },
        data: {
          role: "PRO",
          subscriptionPeriodStart: periodStart,
          subscriptionPeriodEnd: periodEnd,
          billingInterval: internalPlan === "pro_annual" ? "year" : "month",
        },
      });
      console.log("[Whop webhook] User set to PRO:", dccUser.id);

      try {
        const user = await db.user.findUnique({
          where: { id: dccUser.id },
          select: { email: true, name: true },
        });
        if (user) {
          const endForEmail = periodEnd ?? periodStart;
          const result = await sendProWelcomeEmail(
            user.email,
            user.name,
            periodStart,
            endForEmail,
            {
              billingInterval: internalPlan === "pro_annual" ? "year" : "month",
            }
          );
          if (result.ok) {
            console.info("[Whop webhook] PRO welcome email sent to", user.email);
          } else if (result.reason === "smtp_not_configured") {
            console.warn("[Whop webhook] PRO welcome email skipped: SMTP not configured");
          } else {
            console.error("[Whop webhook] PRO welcome email failed:", result.error);
          }
        }
      } catch (emailErr) {
        console.error("[Whop webhook] PRO welcome email error:", emailErr);
      }
    }

    if (action === "membership.went_invalid" && membershipId) {
      const affected = await db.subscription.findFirst({
        where: { whopMembershipId: membershipId },
        select: { userId: true },
      });

      await db.subscription.updateMany({
        where: { whopMembershipId: membershipId },
        data: {
          status: "cancelled",
          currentPeriodEnd: new Date(),
        },
      });

      if (affected) {
        await db.user.update({
          where: { id: affected.userId },
          data: {
            role: "FREE",
            subscriptionPeriodStart: null,
            subscriptionPeriodEnd: null,
            billingInterval: null,
            subscriptionReminder7dForEnd: null,
            subscriptionReminder1dForEnd: null,
            subscriptionReminder30dForEnd: null,
          },
        });
        console.log("[Whop webhook] User set to FREE:", affected.userId);
      }
    }
  } catch (err) {
    console.error("[Whop webhook] Processing error:", err);
    // Still return 200 to avoid Whop retries on non-recoverable errors.
  }

  return NextResponse.json({ received: true });
}

