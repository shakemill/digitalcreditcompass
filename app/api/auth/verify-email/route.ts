import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/sendEmail";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login?error=missing_token", req.url));
  }

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?error=invalid_or_expired", req.url));
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const signInUrl = `${baseUrl}/auth/login`;
  try {
    await sendWelcomeEmail(user.email, user.name, signInUrl);
  } catch (err) {
    console.error("[verify-email] Failed to send welcome email:", err);
  }

  return NextResponse.redirect(new URL("/auth/login?verified=1", req.url));
}
