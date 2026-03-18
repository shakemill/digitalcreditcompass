This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Whop Integration Setup

DCC supports [Whop.com](https://whop.com) as a second payment provider alongside Stripe. Users who purchase a subscription on Whop automatically get PRO access.

### Environment Variables

Add the following to `.env` (or `.env.local`):

```env
WHOP_WEBHOOK_SECRET=       # Whop Dashboard → Developer → Webhooks → Secret
WHOP_API_KEY=              # Whop Dashboard → Developer → API Keys
WHOP_PRO_MONTHLY_PLAN_ID=  # plan_… from Whop Dashboard → Settings → Plans
WHOP_PRO_ANNUAL_PLAN_ID=   # plan_… from Whop Dashboard → Settings → Plans
WHOP_CLIENT_ID=            # Whop Dashboard → Developer → OAuth → Client ID
WHOP_CLIENT_SECRET=        # Whop Dashboard → Developer → OAuth → Client Secret
WHOP_REDIRECT_URI=https://yourdomain.com/api/auth/whop

# Public (client-side, for login button)
NEXT_PUBLIC_WHOP_CLIENT_ID=          # same as WHOP_CLIENT_ID
NEXT_PUBLIC_WHOP_REDIRECT_URI=https://yourdomain.com/api/auth/whop

# Checkout links (direct Whop purchase pages)
NEXT_PUBLIC_WHOP_CHECKOUT_ANNUAL=https://whop.com/checkout/plan_…
NEXT_PUBLIC_WHOP_CHECKOUT_MONTHLY=https://whop.com/checkout/plan_…
```

### Webhook Registration

1. Go to **Whop Dashboard → Developer → Webhooks**
2. Add a new webhook with URL: `https://yourdomain.com/api/webhooks/whop`
3. Subscribe to events: `membership.went_valid`, `membership.went_invalid`
4. Copy the webhook secret to `WHOP_WEBHOOK_SECRET`

The webhook handler (`app/api/webhooks/whop/route.ts`) verifies HMAC-SHA256 signatures and processes membership events:
- `membership.went_valid` → activates subscription, sets user role to PRO
- `membership.went_invalid` → cancels subscription, reverts user role to FREE

If no DCC user is linked yet, the webhook stores a `PendingWhopSubscription` that gets claimed when the user logs in via Whop OAuth.

### OAuth (Login with Whop)

1. Go to **Whop Dashboard → Developer → OAuth**
2. Set the redirect URI to `https://yourdomain.com/api/auth/whop`
3. Copy Client ID and Client Secret to env vars

The OAuth flow (`app/api/auth/whop/route.ts`):
1. User clicks "Sign in with Whop" on the login page
2. Redirected to Whop OAuth consent screen
3. Whop redirects back with an authorization code
4. DCC exchanges the code for an access token, fetches user profile and active memberships
5. Links the Whop user to an existing DCC account (by email match or existing session) or creates a new one
6. Claims any `PendingWhopSubscription` records and activates PRO access

### Stripe & Whop Cohabitation

- Both providers write to the same `Subscription` table with a `provider` field (`"stripe"` or `"whop"`)
- Access control is provider-agnostic: `user.role` is set to `"PRO"` or `"FREE"` by both webhook handlers
- The `hasActiveSubscription()` helper in `lib/subscriptions.ts` checks subscription status and period end regardless of provider
- Existing Stripe webhook (`app/api/stripe/webhook/route.ts`) is untouched

### Running Tests

```bash
pnpm vitest run
```

Tests in `__tests__/whop-webhook.test.ts` cover:
- Valid/invalid signature verification
- Subscription creation on `membership.went_valid`
- Pending subscription for unknown plans or unlinked users
- Cancellation on `membership.went_invalid`
- `hasActiveSubscription` logic (active, cancelled, expired, missing)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
