"use client";

const WHOP_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect width="24" height="24" rx="6" fill="#FF6243" />
    <path d="M7 8h10v2H7V8zm0 3h10v2H7v-2zm0 3h7v2H7v-2z" fill="#fff" />
  </svg>
);

export function WhopAuthButton({ label }: { label: string }) {
  const whopClientId = process.env.NEXT_PUBLIC_WHOP_CLIENT_ID;
  const whopRedirectUri =
    process.env.NEXT_PUBLIC_WHOP_REDIRECT_URI ||
    (typeof window !== "undefined" ? `${window.location.origin}/api/auth/whop` : "");
  const whopOAuthUrl =
    whopClientId && whopRedirectUri
      ? `https://whop.com/oauth?client_id=${whopClientId}&redirect_uri=${encodeURIComponent(whopRedirectUri)}&response_type=code&scope=openid`
      : null;

  if (whopOAuthUrl) {
    return (
      <a
        href={whopOAuthUrl}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-card px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50"
      >
        {WHOP_ICON}
        {label}
      </a>
    );
  }

  return (
    <div
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-text-muted"
      title="Add NEXT_PUBLIC_WHOP_CLIENT_ID to .env and restart dev server"
    >
      {WHOP_ICON}
      {label} (not configured)
    </div>
  );
}
