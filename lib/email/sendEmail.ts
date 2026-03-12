import nodemailer from "nodemailer";

function getFrom(): string {
  const v = (process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
  return v || "noreply@example.com";
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_SECRET;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping verification email to", email);
    return;
  }

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Verify your DCC account",
    html: `
      <p>Hi ${name},</p>
      <p>Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>
      <p>— DCC Team</p>
    `,
    text: `Hi ${name}, please verify your email: ${verifyUrl} (expires in 24 hours). — DCC Team`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping password reset email to", email);
    return;
  }

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Reset your DCC password",
    html: `
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can ignore this email.</p>
      <p>— DCC Team</p>
    `,
    text: `Hi ${name}, reset your password: ${resetUrl} (expires in 1 hour). — DCC Team`,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  signInUrl: string
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping welcome email to", email);
    return;
  }

  const html = `
    <h2>Welcome to DCC</h2>
    <p><strong>Your account is activated</strong></p>
    <p>Hi ${name},</p>
    <p>Your email has been verified successfully. Welcome to Digital Credit Compass.</p>
    <p>Your Free plan is activated: you can now access the Risk Planner, save a scenario, and explore the Yield Board.</p>
    <p><a href="${signInUrl}">Sign in</a></p>
    <p>We help you model Bitcoin, fiat, and stablecoin income with transparent risk scoring — no custody, no execution.</p>
    <p style="margin-top: 2em; color: #666; font-size: 0.9em;">Digital Credit Compass — Clarity Before Capital</p>
  `;
  const text = `Welcome to DCC\nYour account is activated\n\nHi ${name},\n\nYour email has been verified successfully. Welcome to Digital Credit Compass.\n\nYour Free plan is activated: you can now access the Risk Planner, save a scenario, and explore the Yield Board.\n\nSign in: ${signInUrl}\n\nWe help you model Bitcoin, fiat, and stablecoin income with transparent risk scoring — no custody, no execution.\n\n— Digital Credit Compass — Clarity Before Capital`;

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Welcome to Digital Credit Compass",
    html,
    text,
  });
}

export async function sendProWelcomeEmail(
  email: string,
  name: string,
  periodStart: Date,
  periodEnd: Date
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping PRO welcome email to", email);
    return;
  }

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const startStr = fmt(periodStart);
  const endStr = fmt(periodEnd);

  const html = `
    <h2>Welcome to PRO</h2>
    <p><strong>Your subscription is active</strong></p>
    <p>Hi ${name},</p>
    <p>Thank you for upgrading to Digital Credit Compass PRO. You now have full access to unlimited scenarios, the full Yield Board, PDF export, and more.</p>
    <p><strong>Subscription start:</strong> ${startStr}</p>
    <p><strong>Subscription end:</strong> ${endStr}</p>
    <p>We help you model Bitcoin, fiat, and stablecoin income with transparent risk scoring — no custody, no execution.</p>
    <p style="margin-top: 2em; color: #666; font-size: 0.9em;">Digital Credit Compass — Clarity Before Capital</p>
  `;
  const text = `Welcome to PRO\nYour subscription is active\n\nHi ${name},\n\nThank you for upgrading to Digital Credit Compass PRO. You now have full access to unlimited scenarios, the full Yield Board, PDF export, and more.\n\nSubscription start: ${startStr}\nSubscription end: ${endStr}\n\n— Digital Credit Compass — Clarity Before Capital`;

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Welcome to DCC PRO",
    html,
    text,
  });
}

export async function sendSubscriptionExpiryReminder(
  email: string,
  name: string,
  periodEnd: Date,
  inDays: number
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping subscription expiry reminder to", email);
    return;
  }

  const dayLabel = inDays === 1 ? "1 day" : `${inDays} days`;
  const subject = `Your DCC PRO subscription expires in ${dayLabel}`;
  const endStr = periodEnd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")).trim();
  const pricingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";

  const html = `
    <h2>Subscription reminder</h2>
    <p>Hi ${name},</p>
    <p>Your Digital Credit Compass PRO subscription will expire in <strong>${dayLabel}</strong>.</p>
    <p><strong>Expiration date:</strong> ${endStr}</p>
    <p>To keep your PRO benefits, renew your subscription before this date.</p>
    <p><a href="${pricingUrl}">View pricing and renew</a></p>
    <p style="margin-top: 2em; color: #666; font-size: 0.9em;">Digital Credit Compass — Clarity Before Capital</p>
  `;
  const text = `Hi ${name},\n\nYour Digital Credit Compass PRO subscription will expire in ${dayLabel}.\nExpiration date: ${endStr}\n\nTo keep your PRO benefits, renew before this date.\nView pricing: ${pricingUrl}\n\n— Digital Credit Compass — Clarity Before Capital`;

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject,
    html,
    text,
  });
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const transport = getTransport();
  const to = (process.env.CONTACT_EMAIL || "support@digitalcreditcompass.com").trim();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping contact form from", params.email);
    return;
  }

  await transport.sendMail({
    from: getFrom(),
    to,
    replyTo: params.email,
    subject: `[DCC Contact] ${params.subject}`,
    html: `
      <p><strong>From:</strong> ${params.name} &lt;${params.email}&gt;</p>
      <p><strong>Subject:</strong> ${params.subject}</p>
      <hr />
      <p>${params.message.replace(/\n/g, "<br />")}</p>
    `,
    text: `From: ${params.name} <${params.email}>\nSubject: ${params.subject}\n\n${params.message}`,
  });
}
