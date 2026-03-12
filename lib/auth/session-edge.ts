/**
 * Edge-safe session verification (no Node crypto). Use in middleware.
 */
import type { UserRole } from "@prisma/client";

const COOKIE_NAME = "dcc_session";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

function decodeBase64Url(data: string): string {
  const bin = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(new Uint8Array([...bin].map((c) => c.charCodeAt(0))));
}

function encodeBase64Url(data: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(data)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function verifySessionTokenEdge(token: string): Promise<SessionPayload | null> {
  try {
    const secret =
      process.env.SESSION_SECRET &&
      process.env.SESSION_SECRET.length >= 32
        ? process.env.SESSION_SECRET
        : process.env.NODE_ENV === "development"
          ? "dev-secret-min-32-chars-for-session-signing"
          : null;
    if (!secret) return null;

    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigPayload = encoder.encode(payloadB64);
    const sigBuffer = await crypto.subtle.sign("HMAC", key, sigPayload);
    const expectedSig = encodeBase64Url(sigBuffer);
    if (signature !== expectedSig) return null;

    const payloadStr = decodeBase64Url(payloadB64);
    const payload = JSON.parse(payloadStr) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1]?.trim();
  if (!token) return null;
  return null; // Must be resolved async; middleware will use getSessionAsync
}

export async function getSessionAsync(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1]?.trim();
  if (!token) return null;
  return verifySessionTokenEdge(token);
}
