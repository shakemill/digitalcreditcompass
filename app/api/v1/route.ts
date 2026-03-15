import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
const MAX_AGE_SEC = 300; // 5 minutes (Standard Webhooks replay protection)

/** Standard Webhooks verification: HMAC-SHA256(webhook-id + '.' + webhook-timestamp + '.' + payload, secret). */
function verifyWhopWebhook(
  rawBody: string,
  headers: { get: (name: string) => string | null }
): { ok: true; payload: unknown } | { ok: false; status: number; body: string } {
  if (!webhookSecret?.trim()) {
    return { ok: false, status: 503, body: "Webhook not configured" };
  }

  const webhookId = headers.get("webhook-id");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const webhookSignature = headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return { ok: false, status: 400, body: "Missing webhook-id, webhook-timestamp, or webhook-signature" };
  }

  const timestamp = parseInt(webhookTimestamp, 10);
  if (Number.isNaN(timestamp)) {
    return { ok: false, status: 400, body: "Invalid webhook-timestamp" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > MAX_AGE_SEC) {
    return { ok: false, status: 400, body: "Webhook timestamp too old or in future" };
  }

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedSig = createHmac("sha256", webhookSecret.trim()).update(signedContent).digest("base64");

  // webhook-signature can be "v1,<sig>" or multiple "v1,sig1 v1,sig2"
  const expectedBuf = Buffer.from(expectedSig, "base64");
  const parts = webhookSignature.split(/\s+/);
  let valid = false;
  for (const part of parts) {
    const [, sig] = part.split(",");
    if (!sig?.trim()) continue;
    try {
      const receivedBuf = Buffer.from(sig, "base64");
      if (receivedBuf.length === expectedBuf.length && timingSafeEqual(expectedBuf, receivedBuf)) {
        valid = true;
        break;
      }
    } catch {
      // ignore invalid base64
    }
  }
  if (!valid) {
    return { ok: false, status: 400, body: "Invalid signature" };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return { ok: false, status: 400, body: "Invalid JSON body" };
  }

  return { ok: true, payload };
}

/** GET: health check / browser visit. */
export async function GET() {
  return NextResponse.json(
    { message: "Webhook endpoint — POST only; send webhooks here." },
    { status: 200 }
  );
}

/** POST: Whop webhook (Standard Webhooks). Raw body required for signature verification. */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const result = verifyWhopWebhook(rawBody, req.headers);

  if (!result.ok) {
    return NextResponse.json({ error: result.body }, { status: result.status });
  }

  const payload = result.payload as { type?: string; data?: unknown };
  const eventType = payload?.type ?? "unknown";
  console.info("[whop webhook] received", eventType, payload?.data != null ? "(has data)" : "");

  // Handle events as needed (e.g. payment.succeeded, membership.activated). For now just acknowledge.
  return NextResponse.json({ received: true }, { status: 200 });
}
