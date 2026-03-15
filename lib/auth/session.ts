import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

const COOKIE_NAME = "dcc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "development") {
    return "dev-secret-min-32-chars-for-session-signing";
  }
  throw new Error("SESSION_SECRET must be set and at least 32 characters");
}

function encodeBase64Url(data: string): string {
  return Buffer.from(data, "utf8").toString("base64url");
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data, "base64url").toString("utf8");
}

function sign(payload: string): string {
  const secret = getSecret();
  const crypto = require("crypto");
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("base64url");
}

export function createSessionToken(payload: SessionPayload): string {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = encodeBase64Url(payloadStr);
  const signature = sign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;
    const expectedSig = sign(payloadB64);
    if (signature !== expectedSig) return null;
    const payloadStr = decodeBase64Url(payloadB64);
    const payload = JSON.parse(payloadStr) as SessionPayload;
    if (!payload.sub || !payload.email || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  // Use same path, secure, sameSite as setSessionCookie so the browser clears the cookie in production
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function getSessionTokenFromRequest(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) return null;
  return verifySessionToken(token);
}
