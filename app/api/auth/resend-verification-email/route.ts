import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendEmail";

const bodySchema = z.object({
  email: z.string().email("Invalid email"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "This account is already verified. You can sign in." }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.trim() ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "").trim() ||
      "http://localhost:3000";
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
    let emailSent = false;
    try {
      emailSent = await sendVerificationEmail(user.email, user.name, verifyUrl);
    } catch (err) {
      console.error("[resend-verification-email] Send failed:", err);
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Verification email sent. Check your inbox."
        : "Verification email could not be sent (SMTP not configured or failed). Please contact support.",
    });
  } catch (e) {
    console.error("[resend-verification-email]", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
