import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  sendProMonthlyReminder7d,
  sendProMonthlyReminder1d,
  sendProAnnualReminder30d,
  sendProAnnualReminder7d,
} from "@/lib/email/sendEmail";

/**
 * Cron job: send subscription expiry reminder emails.
 * - Monthly: 7 days before and 1 day before expiration.
 * - Annual: 30 days before and 7 days before expiration (per DCC-Email-Templates).
 * Call via Vercel Cron (GET). Protect with CRON_SECRET in production.
 */
function startOfDayUTC(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDayUTC(new Date());
  const in1Start = addDays(today, 1);
  const in1End = addDays(today, 2);
  const in7Start = addDays(today, 7);
  const in7End = addDays(today, 8);
  const in30Start = addDays(today, 30);
  const in30End = addDays(today, 31);

  let sent7d = 0;
  let sent1d = 0;
  let sent30d = 0;
  const errors: string[] = [];

  try {
    const proPlan = await db.plan.findUnique({ where: { slug: "pro" } });
    const planPriceMonth = proPlan ? `$${(proPlan.priceMonthCents / 100).toFixed(2)}` : "$45.00";
    const planPriceYear = proPlan ? `$${(proPlan.priceYearCents / 100).toFixed(2)}` : "$360.00";
    const annualSavings =
      proPlan
        ? `$${((12 * proPlan.priceMonthCents - proPlan.priceYearCents) / 100).toFixed(2)}`
        : "$180.00";

    const proUsers = await db.user.findMany({
      where: {
        role: "PRO",
        subscriptionPeriodEnd: { not: null },
        billingInterval: { in: ["month", "year"] },
      },
      select: {
        id: true,
        email: true,
        name: true,
        billingInterval: true,
        subscriptionPeriodEnd: true,
        subscriptionReminder7dForEnd: true,
        subscriptionReminder1dForEnd: true,
        subscriptionReminder30dForEnd: true,
      },
    });

    for (const u of proUsers) {
      const periodEnd = u.subscriptionPeriodEnd!;

      const in1Window = periodEnd >= in1Start && periodEnd < in1End;
      const in7Window = periodEnd >= in7Start && periodEnd < in7End;
      const in30Window = periodEnd >= in30Start && periodEnd < in30End;

      const alreadySent7d = u.subscriptionReminder7dForEnd?.getTime() === periodEnd.getTime();
      const alreadySent1d = u.subscriptionReminder1dForEnd?.getTime() === periodEnd.getTime();
      const alreadySent30d = u.subscriptionReminder30dForEnd?.getTime() === periodEnd.getTime();

      if (u.billingInterval === "month") {
        if (in7Window && !alreadySent7d) {
          try {
            await sendProMonthlyReminder7d(u.email, u.name ?? "Subscriber", periodEnd, planPriceMonth, {
              annualSavings,
            });
            await db.user.update({
              where: { id: u.id },
              data: { subscriptionReminder7dForEnd: periodEnd },
            });
            sent7d++;
          } catch (e) {
            errors.push(`7d ${u.email}: ${String(e)}`);
          }
        }
        if (in1Window && !alreadySent1d) {
          try {
            await sendProMonthlyReminder1d(u.email, u.name ?? "Subscriber", periodEnd, planPriceMonth);
            await db.user.update({
              where: { id: u.id },
              data: { subscriptionReminder1dForEnd: periodEnd },
            });
            sent1d++;
          } catch (e) {
            errors.push(`1d ${u.email}: ${String(e)}`);
          }
        }
      }

      if (u.billingInterval === "year") {
        if (in30Window && !alreadySent30d) {
          try {
            await sendProAnnualReminder30d(u.email, u.name ?? "Subscriber", periodEnd, planPriceYear);
            await db.user.update({
              where: { id: u.id },
              data: { subscriptionReminder30dForEnd: periodEnd },
            });
            sent30d++;
          } catch (e) {
            errors.push(`30d ${u.email}: ${String(e)}`);
          }
        }
        if (in7Window && !alreadySent7d) {
          try {
            await sendProAnnualReminder7d(u.email, u.name ?? "Subscriber", periodEnd, planPriceYear);
            await db.user.update({
              where: { id: u.id },
              data: { subscriptionReminder7dForEnd: periodEnd },
            });
            sent7d++;
          } catch (e) {
            errors.push(`7d annual ${u.email}: ${String(e)}`);
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      sent: { "7d": sent7d, "1d": sent1d, "30d": sent30d },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (e) {
    console.error("[cron] subscription-reminders failed:", e);
    return NextResponse.json(
      { error: "Subscription reminders job failed" },
      { status: 500 }
    );
  }
}
