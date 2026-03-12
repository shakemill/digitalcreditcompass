import { NextResponse } from "next/server";
import { getSessionFromCookie, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function PATCH(req: Request) {
  const session = await getSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, passwordHash: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const updates: { name?: string; passwordHash?: string } = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 1) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    updates.name = name;
  }

  if (body.newPassword !== undefined) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Current password required to change password" }, { status: 400 });
    }
    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (body.newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }
    updates.passwordHash = await hashPassword(body.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: updates,
    select: { id: true, email: true, name: true, role: true },
  });

  await setSessionCookie({
    sub: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
  });

  return NextResponse.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    },
  });
}
