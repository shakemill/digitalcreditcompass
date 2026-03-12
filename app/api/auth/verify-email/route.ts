import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/sendEmail";
import { getBaseUrlFromRequest } from "@/lib/utils";

/** Allow 5 minutes clock skew between register and verify (e.g. different instances). */
const EXPIRY_CLOCK_SKEW_MS = 5 * 60 * 1000;

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(req);
  const rawToken = req.nextUrl.searchParams.get("token");
  const token = rawToken?.trim();
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=missing_token`);
  }

  // Lenient expiry: accept if link not expired relative to (now - skew)
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() - EXPIRY_CLOCK_SKEW_MS);

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: { gt: expiryThreshold },
    },
  });

  if (!user) {
    // Optionally distinguish expired vs invalid: find by token only
    const expiredUser = await db.user.findFirst({
      where: { emailVerificationToken: token },
    });
    const error = expiredUser ? "link_expired" : "invalid_or_expired";
    return NextResponse.redirect(`${baseUrl}/auth/login?error=${error}`);
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  const signInUrl = `${baseUrl}/auth/login`;
  try {
    await sendWelcomeEmail(user.email, user.name, signInUrl);
  } catch (err) {
    console.error("[verify-email] Failed to send welcome email:", err);
  }

  return NextResponse.redirect(`${baseUrl}/auth/login?verified=1`);
}
