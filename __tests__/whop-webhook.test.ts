import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ── Mocks ─────────────────────────────────────────────

const mockDb = {
  user: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  subscription: {
    upsert: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
  },
  pendingWhopSubscription: {
    upsert: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  plan: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({ db: mockDb }));

vi.mock("@/lib/subscriptions", () => ({
  upsertSubscription: vi.fn(),
  hasActiveSubscription: vi.fn(),
}));

// ── Env vars ──────────────────────────────────────────

const WEBHOOK_SECRET = "test_secret_abc123";
const MONTHLY_PLAN_ID = "plan_monthly_test";
const ANNUAL_PLAN_ID = "plan_annual_test";

beforeEach(() => {
  vi.resetAllMocks();
  process.env.WHOP_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.WHOP_PRO_MONTHLY_PLAN_ID = MONTHLY_PLAN_ID;
  process.env.WHOP_PRO_ANNUAL_PLAN_ID = ANNUAL_PLAN_ID;

  mockDb.plan.findUnique.mockResolvedValue({ id: "plan_cuid_pro" });
  mockDb.user.update.mockResolvedValue({});
  mockDb.subscription.upsert.mockResolvedValue({});
  mockDb.subscription.updateMany.mockResolvedValue({ count: 1 });
  mockDb.pendingWhopSubscription.upsert.mockResolvedValue({});
});

// ── Helpers ───────────────────────────────────────────

function makeSignature(body: string): string {
  return crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
}

function buildRequest(body: object, signature?: string): Request {
  const raw = JSON.stringify(body);
  const sig = signature ?? makeSignature(raw);
  return new Request("http://localhost:3000/api/webhooks/whop", {
    method: "POST",
    headers: { "x-whop-signature": sig, "content-type": "application/json" },
    body: raw,
  });
}

async function callWebhook(body: object, signature?: string) {
  const { POST } = await import("@/app/api/webhooks/whop/route");
  const req = buildRequest(body, signature);
  // NextRequest wraps Request; the route reads req.text() and req.headers which work on plain Request too.
  // But our route expects NextRequest, so we import NextRequest to wrap it.
  const { NextRequest } = await import("next/server");
  const nextReq = new NextRequest(req);
  return POST(nextReq);
}

// ── Tests ─────────────────────────────────────────────

describe("Whop Webhook", () => {
  // Test 1: Valid membership.went_valid → subscription created
  it("creates subscription on membership.went_valid with known plan", async () => {
    const dccUser = { id: "dcc_user_1" };
    mockDb.user.findFirst.mockResolvedValueOnce(dccUser);

    const body = {
      action: "membership.went_valid",
      data: {
        id: "mem_123",
        user_id: "whop_user_1",
        plan_id: MONTHLY_PLAN_ID,
        renewal_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
      },
    };

    const res = await callWebhook(body);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    const { upsertSubscription } = await import("@/lib/subscriptions");
    expect(upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "dcc_user_1",
        provider: "whop",
        status: "active",
        plan: "pro_monthly",
      }),
    );

    expect(mockDb.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "dcc_user_1" },
        data: expect.objectContaining({ role: "PRO" }),
      }),
    );
  });

  // Test 2: Invalid signature → 401 returned
  it("returns 401 for invalid signature", async () => {
    const body = {
      action: "membership.went_valid",
      data: { id: "mem_123", user_id: "u1", plan_id: MONTHLY_PLAN_ID },
    };

    const res = await callWebhook(body, "bad_signature_value");
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  // Test 3: Unknown plan_id → 200 returned, pending subscription stored
  it("stores pending subscription for unknown plan_id", async () => {
    const body = {
      action: "membership.went_valid",
      data: {
        id: "mem_unknown",
        user_id: "whop_user_2",
        plan_id: "plan_unknown_xyz",
        renewal_period_end: null,
      },
    };

    const res = await callWebhook(body);
    expect(res.status).toBe(200);

    expect(mockDb.pendingWhopSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { whopMembershipId: "mem_unknown" },
        create: expect.objectContaining({
          whopMembershipId: "mem_unknown",
          whopUserId: "whop_user_2",
          plan: "plan_unknown_xyz",
        }),
      }),
    );
  });

  // Test 4: membership.went_invalid → subscription cancelled
  it("cancels subscription on membership.went_invalid", async () => {
    mockDb.subscription.findFirst.mockResolvedValueOnce({ userId: "dcc_user_1" });

    const body = {
      action: "membership.went_invalid",
      data: { id: "mem_123", user_id: "whop_user_1" },
    };

    const res = await callWebhook(body);
    expect(res.status).toBe(200);

    expect(mockDb.subscription.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { whopMembershipId: "mem_123" },
        data: expect.objectContaining({ status: "cancelled" }),
      }),
    );

    expect(mockDb.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "dcc_user_1" },
        data: expect.objectContaining({ role: "FREE" }),
      }),
    );
  });

  // Test 5: went_valid for already-existing subscription → upsert updates
  it("upserts subscription if it already exists", async () => {
    const dccUser = { id: "dcc_user_existing" };
    mockDb.user.findFirst.mockResolvedValueOnce(dccUser);

    const body = {
      action: "membership.went_valid",
      data: {
        id: "mem_existing",
        user_id: "whop_user_existing",
        plan_id: ANNUAL_PLAN_ID,
        renewal_period_end: Math.floor(Date.now() / 1000) + 86400 * 365,
      },
    };

    const res = await callWebhook(body);
    expect(res.status).toBe(200);

    const { upsertSubscription } = await import("@/lib/subscriptions");
    expect(upsertSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "dcc_user_existing",
        plan: "pro_annual",
        status: "active",
      }),
    );
  });

  // Test 6: No DCC user yet → pending subscription stored
  it("stores pending subscription when no DCC user is linked", async () => {
    mockDb.user.findFirst.mockResolvedValueOnce(null);

    const body = {
      action: "membership.went_valid",
      data: {
        id: "mem_no_user",
        user_id: "whop_user_orphan",
        plan_id: MONTHLY_PLAN_ID,
        renewal_period_end: null,
      },
    };

    const res = await callWebhook(body);
    expect(res.status).toBe(200);

    expect(mockDb.pendingWhopSubscription.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { whopMembershipId: "mem_no_user" },
        create: expect.objectContaining({
          whopUserId: "whop_user_orphan",
          plan: "pro_monthly",
        }),
      }),
    );
  });
});

describe("hasActiveSubscription", () => {
  let realHasActiveSubscription: typeof import("@/lib/subscriptions").hasActiveSubscription;

  beforeEach(async () => {
    const actual = await vi.importActual<typeof import("@/lib/subscriptions")>("@/lib/subscriptions");
    realHasActiveSubscription = actual.hasActiveSubscription;
  });

  it("returns true for active subscription with future periodEnd", async () => {
    (mockDb.subscription as any).findUnique = vi.fn().mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86400 * 1000),
    });
    const result = await realHasActiveSubscription("user_1");
    expect(result).toBe(true);
  });

  it("returns false for cancelled subscription", async () => {
    (mockDb.subscription as any).findUnique = vi.fn().mockResolvedValue({
      status: "cancelled",
      currentPeriodEnd: new Date(Date.now() + 86400 * 1000),
    });
    const result = await realHasActiveSubscription("user_2");
    expect(result).toBe(false);
  });

  it("returns false for expired subscription", async () => {
    (mockDb.subscription as any).findUnique = vi.fn().mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() - 86400 * 1000),
    });
    const result = await realHasActiveSubscription("user_3");
    expect(result).toBe(false);
  });

  it("returns false when no subscription exists", async () => {
    (mockDb.subscription as any).findUnique = vi.fn().mockResolvedValue(null);
    const result = await realHasActiveSubscription("user_none");
    expect(result).toBe(false);
  });
});
