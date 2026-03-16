import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email/sendEmail";

const bodySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        passwordHash,
        role: "FREE",
        emailVerified: false,
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
      emailSent = await sendVerificationEmail(email, name, verifyUrl);
    } catch (emailErr) {
      console.error("[register] Verification email failed:", emailErr);
      // User is already created; do not fail the request
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? "Check your email to activate your account."
        : "Account created. Verification email could not be sent (SMTP not configured or failed). Please contact support to activate your account.",
    });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Registration failed." },
      { status: 500 }
    );
  }
}
