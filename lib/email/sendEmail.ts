import nodemailer from "nodemailer";
import { wrapEmail } from "./templates/emailLayout";

function getFrom(): string {
  const v = (process.env.SMTP_FROM || process.env.MAIL_FROM || process.env.SMTP_USER || "").trim();
  return v || "noreply@example.com";
}

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "").trim() ||
    "http://localhost:3000"
  );
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

/** Returns true if the email was sent, false if SMTP is not configured. Throws if send fails. */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verifyUrl: string
): Promise<boolean> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping verification email to", email);
    return false;
  }

  const content = `
    <p>Hi ${name},</p>
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyUrl}" style="color:#0891B2;text-decoration:underline;">Verify my email</a></p>
    <p style="color:#666;font-size:14px;">This link expires in 24 hours.</p>
    <p>— DCC Team</p>
  `;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Verify your DCC account",
    html: wrapEmail(content),
    text: `Hi ${name}, please verify your email: ${verifyUrl} (expires in 24 hours). — DCC Team`,
  });
  return true;
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

  const content = `
    <p>Hi ${name},</p>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetUrl}" style="color:#0891B2;text-decoration:underline;">Reset my password</a></p>
    <p style="color:#666;font-size:14px;">This link expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
    <p>— DCC Team</p>
  `;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Reset your DCC password",
    html: wrapEmail(content),
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

  const baseUrl = getBaseUrl();
  const upgradeUrl = baseUrl ? `${baseUrl}/#pricing` : "#pricing";
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:24px;">Welcome to Digital Credit Compass</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining Digital Credit Compass!</p>
    <p><strong>Your Free account is now active.</strong> Here's what you can do right away:</p>
    <ul style="margin:8px 0;">
      <li>Access the Fiat Planner with basic data</li>
      <li>Browse public Yield Boards</li>
      <li>Explore general market reports</li>
    </ul>
    <p>Ready to unlock more? Upgrade to Pro to get:</p>
    <ul style="margin:8px 0;">
      <li>All 3 Planners (Fiat, Stablecoin, BTC)</li>
      <li>Yield Boards with advanced comparison</li>
      <li>Detailed, personalized reports</li>
      <li>Priority access to new features</li>
    </ul>
    <p><a href="${upgradeUrl}" style="color:#0891B2;font-weight:600;text-decoration:underline;">Discover the Pro plan →</a></p>
    <p><a href="${signInUrl}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#0891B2;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Sign in</a></p>
  `;
  const text = `Welcome to Digital Credit Compass\n\nHi ${name},\n\nThank you for joining Digital Credit Compass!\n\nYour Free account is now active. Here's what you can do right away:\n• Access the Fiat Planner with basic data\n• Browse public Yield Boards\n• Explore general market reports\n\nReady to unlock more? Upgrade to Pro to get:\n• All 3 Planners (Fiat, Stablecoin, BTC)\n• Yield Boards with advanced comparison\n• Detailed, personalized reports\n• Priority access to new features\n\nDiscover the Pro plan: ${upgradeUrl}\nSign in: ${signInUrl}\n\n— Digital Credit Compass — Clarity Before Capital`;

  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: `Welcome to Digital Credit Compass, ${name} ✨`,
    html: wrapEmail(content),
    text,
  });
}

/** Result of attempting to send PRO welcome email (for logging). */
export type SendProWelcomeResult = { ok: true } | { ok: false; reason: "smtp_not_configured" | "send_failed"; error?: unknown };

export async function sendProWelcomeEmail(
  email: string,
  name: string,
  periodStart: Date,
  periodEnd: Date,
  options?: { planPrice?: string; billingInterval?: "month" | "year"; paymentMethod?: string }
): Promise<SendProWelcomeResult> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping PRO welcome email to", email, "- set SMTP_HOST, SMTP_USER, SMTP_PASS in production");
    return { ok: false, reason: "smtp_not_configured" };
  }

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const nextBillingStr = fmt(periodEnd);
  const planPrice = options?.planPrice ?? "see your plan";
  const billingLabel = options?.billingInterval === "year" ? "Annual" : options?.billingInterval === "month" ? "Monthly" : "";
  const paymentMethod = options?.paymentMethod ?? "your payment method on file";

  const baseUrl = getBaseUrl();
  const dashboardUrl = baseUrl ? `${baseUrl}/dashboard` : "/dashboard";

  const content = `
    <h2 style="margin:0 0 16px 0;font-size:24px;">Welcome to Pro</h2>
    <p><strong>Your subscription is active</strong></p>
    <p>Hi ${name},</p>
    <p>Congratulations! Your Pro subscription is now active.</p>
    <p><strong>📌 Subscription summary:</strong></p>
    <ul style="margin:8px 0;">
      <li>Plan: Pro ${billingLabel} (${planPrice})</li>
      <li>Next billing date: ${nextBillingStr}</li>
      <li>Payment method: ${paymentMethod}</li>
    </ul>
    <p>You now have full access to all features:</p>
    <ul style="margin:8px 0;">
      <li>Fiat, Stablecoin, and BTC Planners</li>
      <li>Yield Boards with unlimited comparison</li>
      <li>Detailed reports and PDF export</li>
      <li>Priority access to new features</li>
    </ul>
    <p><a href="${dashboardUrl}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#0891B2;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Go to my Pro Dashboard →</a></p>
    <p>Questions? Simply reply to this email.</p>
  `;
  const text = `Welcome to Pro\nYour subscription is active\n\nHi ${name},\n\nCongratulations! Your Pro subscription is now active.\n\nSubscription summary:\n• Plan: Pro ${billingLabel} (${planPrice})\n• Next billing date: ${nextBillingStr}\n• Payment method: ${paymentMethod}\n\nYou now have full access to all features: Fiat, Stablecoin, and BTC Planners, Yield Boards with unlimited comparison, Detailed reports and PDF export, Priority access to new features.\n\nGo to Dashboard: ${dashboardUrl}\n\nQuestions? Simply reply to this email.\n\n— Digital Credit Compass — Clarity Before Capital`;

  try {
    await transport.sendMail({
      from: getFrom(),
      to: email,
      subject: `Welcome to Pro, ${name} 🚀`,
      html: wrapEmail(content),
      text,
    });
    return { ok: true };
  } catch (err) {
    console.error("[email] PRO welcome sendMail failed to", email, err);
    return { ok: false, reason: "send_failed", error: err };
  }
}

/** Pro Monthly D-7: 7 days before monthly renewal */
export async function sendProMonthlyReminder7d(
  email: string,
  name: string,
  renewalDate: Date,
  planPrice: string,
  options?: { annualSavings?: string; upgradeAnnualUrl?: string }
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping Pro monthly D-7 reminder to", email);
    return;
  }
  const baseUrl = getBaseUrl();
  const billingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";
  const renewalStr = renewalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const upgradeAnnualUrl = options?.upgradeAnnualUrl ?? (baseUrl ? `${baseUrl}/pricing` : "/pricing");
  const tipBlock = options?.annualSavings
    ? `<p>💡 Tip: Switch to the annual plan and save ${options.annualSavings}!</p><p><a href="${upgradeAnnualUrl}" style="color:#0891B2;text-decoration:underline;">Switch to annual →</a></p>`
    : "";
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:20px;">Your Pro monthly subscription renews in 7 days</h2>
    <p>Hi ${name},</p>
    <p>Your Pro monthly subscription will renew on <strong>${renewalStr}</strong>.</p>
    <p><strong>📌 Details:</strong></p>
    <ul style="margin:8px 0;">
      <li>Plan: Pro Monthly (${planPrice}/month)</li>
      <li>Renewal date: ${renewalStr}</li>
    </ul>
    <p>No action needed if you wish to continue.</p>
    <p>To modify or cancel your subscription, visit your billing page before ${renewalStr}:</p>
    <p><a href="${billingUrl}" style="color:#0891B2;font-weight:600;text-decoration:underline;">Manage my subscription →</a></p>
    ${tipBlock}
  `;
  const text = `Hi ${name},\n\nYour Pro monthly subscription will renew on ${renewalStr}.\n\nDetails: Plan Pro Monthly (${planPrice}/month)\nRenewal date: ${renewalStr}\n\nNo action needed if you wish to continue. To modify or cancel: ${billingUrl}\n\n— Digital Credit Compass — Clarity Before Capital`;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Your Pro subscription renews in 7 days ⏰",
    html: wrapEmail(content),
    text,
  });
}

/** Pro Monthly D-1: 1 day before monthly renewal */
export async function sendProMonthlyReminder1d(
  email: string,
  name: string,
  renewalDate: Date,
  planPrice: string
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping Pro monthly D-1 reminder to", email);
    return;
  }
  const baseUrl = getBaseUrl();
  const billingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";
  const renewalStr = renewalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:20px;">Your subscription renews tomorrow</h2>
    <p>Hi ${name},</p>
    <p>Your Pro monthly subscription will renew tomorrow, <strong>${renewalStr}</strong>.</p>
    <p>A charge of <strong>${planPrice}</strong> will be applied to your payment method on file.</p>
    <p><strong>📌 Summary:</strong></p>
    <ul style="margin:8px 0;">
      <li>Plan: Pro Monthly</li>
      <li>Amount: ${planPrice}</li>
      <li>Renewal: ${renewalStr}</li>
    </ul>
    <p>Everything looks good? No action needed.</p>
    <p>Need to make changes or cancel? You have until midnight (UTC) tonight to update your subscription.</p>
    <p><a href="${billingUrl}" style="color:#0891B2;font-weight:600;text-decoration:underline;">Manage my subscription →</a></p>
  `;
  const text = `Hi ${name},\n\nYour Pro monthly subscription will renew tomorrow, ${renewalStr}.\nA charge of ${planPrice} will be applied.\n\nSummary: Plan Pro Monthly, Amount: ${planPrice}, Renewal: ${renewalStr}\n\nManage subscription: ${billingUrl}\n\n— Digital Credit Compass — Clarity Before Capital`;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Your Pro subscription renews tomorrow ⚠️",
    html: wrapEmail(content),
    text,
  });
}

/** Pro Annual D-30: 30 days before annual renewal */
export async function sendProAnnualReminder30d(
  email: string,
  name: string,
  renewalDate: Date,
  planPrice: string,
  options?: { plannerUsageCount?: number; yieldComparisonsCount?: number; reportsCount?: number }
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping Pro annual D-30 reminder to", email);
    return;
  }
  const baseUrl = getBaseUrl();
  const billingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";
  const renewalStr = renewalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const statsBlock =
    options?.plannerUsageCount != null || options?.yieldComparisonsCount != null || options?.reportsCount != null
      ? `<p>Thank you for being a loyal member! Over the past year, you have:</p><ul style="margin:8px 0;"><li>Used the Planners ${options.plannerUsageCount ?? 0} times</li><li>Compared ${options.yieldComparisonsCount ?? 0} products on the Yield Boards</li><li>Generated ${options.reportsCount ?? 0} reports</li></ul>`
      : `<p>Thank you for being a loyal member!</p>`;
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:20px;">Your Pro annual subscription renews in 30 days</h2>
    <p>Hi ${name},</p>
    <p>Your Pro annual subscription will renew on <strong>${renewalStr}</strong>.</p>
    <p><strong>📌 Subscription details:</strong></p>
    <ul style="margin:8px 0;">
      <li>Plan: Pro Annual (${planPrice}/year)</li>
      <li>Renewal date: ${renewalStr}</li>
    </ul>
    ${statsBlock}
    <p>No action needed to continue your subscription.</p>
    <p>To modify or cancel, visit your billing page:</p>
    <p><a href="${billingUrl}" style="color:#0891B2;font-weight:600;text-decoration:underline;">Manage my subscription →</a></p>
  `;
  const text = `Hi ${name},\n\nYour Pro annual subscription will renew on ${renewalStr}.\n\nPlan: Pro Annual (${planPrice}/year)\nRenewal date: ${renewalStr}\n\nNo action needed to continue. Manage subscription: ${billingUrl}\n\n— Digital Credit Compass — Clarity Before Capital`;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Your Pro annual subscription renews in 30 days 📅",
    html: wrapEmail(content),
    text,
  });
}

/** Pro Annual D-7: 7 days before annual renewal */
export async function sendProAnnualReminder7d(
  email: string,
  name: string,
  renewalDate: Date,
  planPrice: string
): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] SMTP not configured; skipping Pro annual D-7 reminder to", email);
    return;
  }
  const baseUrl = getBaseUrl();
  const billingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";
  const renewalStr = renewalDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const content = `
    <h2 style="margin:0 0 16px 0;font-size:20px;">Your annual renewal is in 7 days</h2>
    <p>Hi ${name},</p>
    <p>Your Pro annual subscription will renew on <strong>${renewalStr}</strong>.</p>
    <p>A charge of <strong>${planPrice}</strong> will be applied to your payment method.</p>
    <p><strong>📌 Summary:</strong></p>
    <ul style="margin:8px 0;">
      <li>Plan: Pro Annual</li>
      <li>Amount: ${planPrice}</li>
      <li>Renewal: ${renewalStr}</li>
    </ul>
    <p>Everything looks good? No action needed on your end.</p>
    <p>To modify or cancel before renewal:</p>
    <p><a href="${billingUrl}" style="color:#0891B2;font-weight:600;text-decoration:underline;">Manage my subscription →</a></p>
    <p>Thank you for being part of the DCC community!</p>
  `;
  const text = `Hi ${name},\n\nYour Pro annual subscription will renew on ${renewalStr}.\nA charge of ${planPrice} will be applied.\n\nSummary: Plan Pro Annual, Amount: ${planPrice}, Renewal: ${renewalStr}\n\nManage subscription: ${billingUrl}\n\nThank you for being part of the DCC community!\n\n— Digital Credit Compass — Clarity Before Capital`;
  await transport.sendMail({
    from: getFrom(),
    to: email,
    subject: "Your Pro annual subscription renews in 7 days ⏳",
    html: wrapEmail(content),
    text,
  });
}

/** @deprecated Use sendProMonthlyReminder7d, sendProMonthlyReminder1d, sendProAnnualReminder30d, sendProAnnualReminder7d instead. */
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
  const planPrice = "$45/month";
  if (inDays === 7) {
    await sendProMonthlyReminder7d(email, name, periodEnd, planPrice);
  } else if (inDays === 1) {
    await sendProMonthlyReminder1d(email, name, periodEnd, planPrice);
  } else if (inDays === 30) {
    await sendProAnnualReminder30d(email, name, periodEnd, "$360/year");
  } else {
    const dayLabel = inDays === 1 ? "1 day" : `${inDays} days`;
    const subject = `Your DCC PRO subscription expires in ${dayLabel}`;
    const endStr = periodEnd.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const baseUrl = getBaseUrl();
    const pricingUrl = baseUrl ? `${baseUrl}/pricing` : "/pricing";
    const content = `
      <h2 style="margin:0 0 16px 0;font-size:20px;">Subscription reminder</h2>
      <p>Hi ${name},</p>
      <p>Your Digital Credit Compass PRO subscription will expire in <strong>${dayLabel}</strong>.</p>
      <p><strong>Expiration date:</strong> ${endStr}</p>
      <p>To keep your PRO benefits, renew your subscription before this date.</p>
      <p><a href="${pricingUrl}" style="color:#0891B2;text-decoration:underline;">View pricing and renew</a></p>
    `;
    await transport.sendMail({
      from: getFrom(),
      to: email,
      subject,
      html: wrapEmail(content),
      text: `Hi ${name},\n\nYour DCC PRO subscription will expire in ${dayLabel}.\nExpiration date: ${endStr}\n\nRenew: ${pricingUrl}\n\n— Digital Credit Compass — Clarity Before Capital`,
    });
  }
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
