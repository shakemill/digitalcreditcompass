import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/sendEmail";
import { getBaseUrlFromRequest } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const baseUrl = getBaseUrlFromRequest(req);
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=missing_token`);
  }

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=invalid_or_expired`);
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
