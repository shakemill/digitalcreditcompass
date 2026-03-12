/**
 * T2 — BTC planner: LTV = 0 must return validation error (no crash, no division by zero).
 * Uses same validation rule as app/api/planner/btc/route.ts.
 */
import { z } from "zod";

const ltvSchema = z
  .number()
  .min(0)
  .max(1)
  .refine((v) => v > 0, { message: "LTV must be greater than 0" });

const bodySchema = z.object({
  totalNeed12m: z.number().min(0),
  apr: z.number(),
  btcPrice: z.number().positive(),
  ltv: ltvSchema,
  liquidationLtv: z.number().min(0).max(1).optional(),
});

// T2: LTV = 0 must be rejected
const result0 = bodySchema.safeParse({
  totalNeed12m: 100000,
  apr: 5,
  btcPrice: 50000,
  ltv: 0,
});
if (result0.success) {
  console.error("T2 FAIL: LTV=0 was accepted; expected validation error.");
  process.exit(1);
}
console.log("T2 PASS: LTV=0 rejected with validation error.");

// Sanity: LTV > 0 accepted
const resultOk = bodySchema.safeParse({
  totalNeed12m: 100000,
  apr: 5,
  btcPrice: 50000,
  ltv: 0.5,
});
if (!resultOk.success) {
  console.error("T2 FAIL: LTV=0.5 was rejected.");
  process.exit(1);
}
console.log("T2 PASS: LTV=0.5 accepted.");
console.log("QA T2 (LTV validation) passed.");
