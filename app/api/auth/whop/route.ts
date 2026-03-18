import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { setSessionCookie, getSessionFromCookie } from "@/lib/auth/session";
import { upsertSubscription } from "@/lib/subscriptions";
import { getBaseUrlFromRequest } from "@/lib/utils";

const WHOP_API = "https://api.whop.com/api/v5";

function mapWhopPlanToInternal(planId: string | null | undefined): string | null {
  if (!planId) return null;
  if (planId === process.env.WHOP_PRO_MONTHLY_PLAN_ID) return "pro_monthly";
  if (planId === process.env.WHOP_PRO_ANNUAL_PLAN_ID) return "pro_annual";
  return null;
}

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(req);
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_no_code`);
  }

  const clientId = process.env.WHOP_CLIENT_ID;
  const clientSecret = process.env.WHOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOP_REDIRECT_URI || `${baseUrl}/api/auth/whop`;

  if (!clientId || !clientSecret) {
    console.error("[Whop OAuth] WHOP_CLIENT_ID or WHOP_CLIENT_SECRET not configured");
    return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_not_configured`);
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch(`${WHOP_API}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text().catch(() => "");
      console.error("[Whop OAuth] Token exchange failed:", tokenRes.status, errBody);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_token_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token as string;
    if (!accessToken) {
      console.error("[Whop OAuth] No access_token in response");
      return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_token_missing`);
    }

    // 2. Fetch Whop user profile
    const meRes = await fetch(`${WHOP_API}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!meRes.ok) {
      console.error("[Whop OAuth] /me failed:", meRes.status);
      return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_me_failed`);
    }
    const whopUser = await meRes.json();
    const whopUserId = whopUser.id as string;
    const whopEmail = (whopUser.email as string | undefined)?.toLowerCase().trim();

    if (!whopUserId) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_no_user_id`);
    }

    // 3. Fetch active memberships
    const membershipsRes = await fetch(`${WHOP_API}/me/memberships?status=active`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const membershipsData = membershipsRes.ok ? await membershipsRes.json() : { data: [] };
    const memberships = Array.isArray(membershipsData?.data) ? membershipsData.data : [];

    // 4. Find or create DCC user
    const existingSession = await getSessionFromCookie();

    let dccUser: { id: string; email: string; name: string; role: string } | null = null;

    // If already logged into DCC, link whopUserId to this user
    if (existingSession) {
      dccUser = await db.user.findUnique({
        where: { id: existingSession.sub },
        select: { id: true, email: true, name: true, role: true },
      });
      if (dccUser) {
        await db.user.update({
          where: { id: dccUser.id },
          data: { whopUserId },
        });
      }
    }

    // If no session, try to find user by whopUserId or email
    if (!dccUser) {
      dccUser = await db.user.findFirst({
        where: { whopUserId },
        select: { id: true, email: true, name: true, role: true },
      });
    }
    if (!dccUser && whopEmail) {
      dccUser = await db.user.findUnique({
        where: { email: whopEmail },
        select: { id: true, email: true, name: true, role: true },
      });
      if (dccUser) {
        await db.user.update({
          where: { id: dccUser.id },
          data: { whopUserId },
        });
      }
    }

    // If still no user, create one
    if (!dccUser) {
      if (!whopEmail) {
        return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_no_email`);
      }
      const crypto = require("crypto");
      const randomPassword = crypto.randomBytes(32).toString("hex");
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const created = await db.user.create({
        data: {
          email: whopEmail,
          name: whopUser.name || whopUser.username || whopEmail.split("@")[0],
          passwordHash,
          role: "FREE",
          whopUserId,
          emailVerified: true,
          isActive: true,
        },
        select: { id: true, email: true, name: true, role: true },
      });
      dccUser = created;
    }

    // 5. Process active memberships → upsert subscriptions
    let upgraded = false;
    for (const membership of memberships) {
      const internalPlan = mapWhopPlanToInternal(membership.plan_id);
      if (!internalPlan) continue;

      const renewalEnd = membership.renewal_period_end;
      const periodEnd =
        typeof renewalEnd === "number" && renewalEnd > 0
          ? new Date(renewalEnd * 1000)
          : null;

      await upsertSubscription({
        userId: dccUser.id,
        provider: "whop",
        providerSubscriptionId: membership.id,
        whopMembershipId: membership.id,
        whopUserId: whopUserId,
        plan: internalPlan,
        status: "active",
        currentPeriodEnd: periodEnd,
      });
      upgraded = true;

      // Consume any pending subscription for this membership
      await db.pendingWhopSubscription.deleteMany({
        where: { whopMembershipId: membership.id },
      });
    }

    // Also claim any pending subscriptions by whopUserId
    const pendingSubs = await db.pendingWhopSubscription.findMany({
      where: { whopUserId, status: "active" },
    });
    for (const pending of pendingSubs) {
      const internalPlan = mapWhopPlanToInternal(pending.plan) || pending.plan;
      await upsertSubscription({
        userId: dccUser.id,
        provider: "whop",
        providerSubscriptionId: pending.whopMembershipId,
        whopMembershipId: pending.whopMembershipId,
        whopUserId,
        plan: internalPlan,
        status: "active",
        currentPeriodEnd: pending.periodEnd,
      });
      upgraded = true;
      await db.pendingWhopSubscription.delete({
        where: { id: pending.id },
      });
    }

    // 6. Upgrade user role if any active membership
    if (upgraded) {
      await db.user.update({
        where: { id: dccUser.id },
        data: { role: "PRO" },
      });
      dccUser = { ...dccUser, role: "PRO" };
    }

    // 7. Set DCC session cookie and redirect
    await setSessionCookie({
      sub: dccUser.id,
      email: dccUser.email,
      name: dccUser.name,
      role: dccUser.role as "FREE" | "PRO" | "SUPER_ADMIN",
    });

    const redirect = dccUser.role === "PRO" || dccUser.role === "SUPER_ADMIN"
      ? "/dashboard/pro"
      : "/dashboard";

    return NextResponse.redirect(`${baseUrl}${redirect}`);
  } catch (err) {
    console.error("[Whop OAuth] Error:", err);
    return NextResponse.redirect(`${baseUrl}/auth/login?error=whop_error`);
  }
}
