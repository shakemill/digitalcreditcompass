import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/prisma";
import { sendProWelcomeEmail } from "@/lib/email/sendEmail";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

type BillingInterval = "month" | "year";

type SubscriptionLike = {
  current_period_start?: number | null;
  current_period_end?: number | null;
  items?: { data?: Array<{ current_period_start?: number; current_period_end?: number; price?: { recurring?: { interval?: string } | null } }> };
};

/** Extract period and interval from Stripe Subscription (top-level or first item). */
function getPeriodFromSubscription(sub: SubscriptionLike): { periodStart: Date; periodEnd: Date | null; interval: BillingInterval | null } {
  const start =
    sub.current_period_start ?? sub.items?.data?.[0]?.current_period_start ?? null;
  const end =
    sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? null;
  const rawInterval = sub.items?.data?.[0]?.price?.recurring?.interval ?? undefined;
  const interval: BillingInterval | null =
    rawInterval === "month" || rawInterval === "year" ? rawInterval : null;
  return {
    periodStart: start ? new Date(start * 1000) : new Date(),
    periodEnd: end ? new Date(end * 1000) : null,
    interval,
  };
}

/** Fallback end date for email when periodEnd is null: +1 month or +1 year from periodStart. */
function getEndForEmail(
  periodStart: Date,
  periodEnd: Date | null,
  interval: BillingInterval | null
): Date {
  if (periodEnd) return periodEnd;
  const d = new Date(periodStart.getTime());
  if (interval === "year") {
    d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  d.setMonth(d.getMonth() + 1);
  return d;
}

/** GET: allow health check / browser visit — returns 200 so the URL doesn't show "page doesn't work". */
export async function GET() {
  return NextResponse.json(
    { message: "Stripe webhook endpoint — Stripe sends POST requests here; opening in a browser is normal." },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? (session.metadata as { userId?: string } | null)?.userId;
      const subscriptionRaw = session.subscription;
      const subscriptionId =
        typeof subscriptionRaw === "string"
          ? subscriptionRaw
          : (subscriptionRaw as Stripe.Subscription | null)?.id ?? null;
      if (!userId || !subscriptionId) {
        console.warn("[webhook] checkout.session.completed skipped: missing userId or subscriptionId", {
          userId: userId ?? null,
          subscriptionId: subscriptionId ?? null,
          client_reference_id: session.client_reference_id ?? null,
          metadata: session.metadata ?? null,
        });
        break;
      }

      try {
        const plan = await db.plan.findUnique({ where: { slug: "pro" } });
        if (!plan) {
          console.warn("[webhook] checkout.session.completed skipped: Plan 'pro' not found in database");
          break;
        }

        let periodStart = new Date();
        let periodEnd: Date | null = null;
        let interval: BillingInterval | null = null;
        const subObj = typeof subscriptionRaw === "object" && subscriptionRaw !== null ? (subscriptionRaw as Stripe.Subscription) : null;
        if (subObj) {
          const period = getPeriodFromSubscription(subObj as SubscriptionLike);
          periodStart = period.periodStart;
          periodEnd = period.periodEnd;
          interval = period.interval;
        }
        if (periodEnd == null) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price"] });
            const period = getPeriodFromSubscription(sub as SubscriptionLike);
            periodStart = period.periodStart;
            periodEnd = period.periodEnd;
            interval = interval ?? period.interval;
          } catch (_) {}
        }

        await db.user.update({
          where: { id: userId },
          data: {
            role: "PRO",
            subscriptionPeriodStart: periodStart,
            subscriptionPeriodEnd: periodEnd,
            billingInterval: interval ?? undefined,
          },
        });
        console.info("[webhook] checkout.session.completed: user updated to PRO", { userId, subscriptionId });
        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd: periodEnd,
          },
          update: {
            stripeSubscriptionId: subscriptionId,
            status: "active",
            currentPeriodEnd: periodEnd,
          },
        });

        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });
          if (user) {
            const endForEmail = getEndForEmail(periodStart, periodEnd, interval);
            const result = await sendProWelcomeEmail(user.email, user.name, periodStart, endForEmail);
            if (result.ok) {
              console.info("[webhook] PRO welcome email sent to", user.email);
            } else if (result.reason === "smtp_not_configured") {
              console.warn("[webhook] PRO welcome email skipped: SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS)");
            } else {
              console.error("[webhook] PRO welcome email send failed:", result.error);
            }
          }
        } catch (err) {
          console.error("[webhook] Failed to send PRO welcome email:", err);
        }
      } catch (err) {
        console.error("[webhook] checkout.session.completed failed", event.id, err);
        return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId ?? (sub as Stripe.Subscription & { client_reference_id?: string }).client_reference_id;
      if (!userId) {
        console.warn("[webhook] customer.subscription.created/updated skipped: missing userId in metadata", { subscriptionId: sub.id });
        break;
      }

      try {
        const plan = await db.plan.findUnique({ where: { slug: "pro" } });
        if (!plan) break;

        const { periodStart, periodEnd, interval } = getPeriodFromSubscription(sub);

        await db.user.update({
          where: { id: userId },
          data: {
            role: "PRO",
            subscriptionPeriodStart: periodStart,
            subscriptionPeriodEnd: periodEnd,
            billingInterval: interval ?? undefined,
          },
        });
        await db.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: periodEnd,
          },
          update: {
            stripeSubscriptionId: sub.id,
            status: sub.status,
            currentPeriodEnd: periodEnd,
          },
        });

        try {
          const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
          });
          if (user) {
            const endForEmail = getEndForEmail(periodStart, periodEnd, interval);
            const result = await sendProWelcomeEmail(user.email, user.name, periodStart, endForEmail);
            if (result.ok) {
              console.info("[webhook] PRO welcome email sent to", user.email);
            } else if (result.reason === "smtp_not_configured") {
              console.warn("[webhook] PRO welcome email skipped: SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS)");
            } else {
              console.error("[webhook] PRO welcome email send failed:", result.error);
            }
          }
        } catch (err) {
          console.error("[webhook] Failed to send PRO welcome email:", err);
        }
      } catch (err) {
        console.error("[webhook] customer.subscription.created/updated failed", event.id, err);
        return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await db.subscription.deleteMany({ where: { userId } }).catch(() => {});
      await db.user.update({
        where: { id: userId },
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
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
