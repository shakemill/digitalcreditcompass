import { NextRequest, NextResponse } from "next/server";
import { getBaseUrlFromRequest } from "@/lib/utils";

/**
 * Redirects to Whop OAuth to sync subscription after checkout.
 * Used as onSuccess URL for Whop checkout - after payment, Whop redirects here,
 * we redirect to OAuth, and /api/auth/whop processes the return and upgrades the user.
 */
export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(req);
  const redirectUri = `${baseUrl}/api/auth/whop`;
  const clientId =
    process.env.WHOP_CLIENT_ID || process.env.NEXT_PUBLIC_WHOP_CLIENT_ID;

  if (!clientId) {
    console.error("[Whop sync] WHOP_CLIENT_ID not configured");
    return NextResponse.redirect(`${baseUrl}/pricing?error=whop_not_configured`);
  }

  const whopOAuthUrl =
    `https://whop.com/oauth?` +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid` +
    `&state=from_checkout`;

  return NextResponse.redirect(whopOAuthUrl);
}
