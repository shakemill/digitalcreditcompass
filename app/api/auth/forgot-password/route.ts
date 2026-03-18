import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email/sendEmail";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }
    const { email } = parsed.data;

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a reset link.",
      });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        `${baseUrl}/auth/reset-password?token=${token}`
      );
    } catch (emailErr) {
      console.error("[forgot-password] Reset email failed:", emailErr);
      // User token is already set; do not fail the request (same generic message)
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a reset link.",
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
