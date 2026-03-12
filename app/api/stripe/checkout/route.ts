import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getSessionFromCookie } from "@/lib/auth/session";
import { db } from "@/lib/prisma";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { priceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const priceId = body.priceId;
  if (!priceId || typeof priceId !== "string") {
    return NextResponse.json({ error: "priceId required" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/api/auth/session/refresh?redirect=/dashboard/pro`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: session.email,
      client_reference_id: session.sub,
      subscription_data: {
        metadata: { userId: session.sub },
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
