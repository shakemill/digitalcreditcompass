/**
 * Update the Pro plan in the database with Stripe Price IDs from .env.
 * Run after creating recurring prices in Stripe Dashboard (Products → Pro → Add price).
 *
 * Add to .env:
 *   STRIPE_PRICE_ID_YEAR=price_xxx   (recurring yearly)
 *   STRIPE_PRICE_ID_MONTH=price_yyy (recurring monthly)
 *
 * Usage: pnpm stripe:update-prices
 */
import dotenv from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";

const cwd = process.cwd();
dotenv.config({ path: resolve(cwd, ".env") });

const prisma = new PrismaClient();

async function main() {
  const priceIdYear = process.env.STRIPE_PRICE_ID_YEAR?.trim();
  const priceIdMonth = process.env.STRIPE_PRICE_ID_MONTH?.trim();

  if (!priceIdYear && !priceIdMonth) {
    console.error(
      "Set at least one of STRIPE_PRICE_ID_YEAR or STRIPE_PRICE_ID_MONTH in .env (Stripe Dashboard → Product → Add price, then copy the Price ID, e.g. price_1ABC...)"
    );
    process.exit(1);
  }

  const pro = await prisma.plan.findUnique({ where: { slug: "pro" } });
  if (!pro) {
    console.error("Plan with slug 'pro' not found in database.");
    process.exit(1);
  }

  await prisma.plan.update({
    where: { slug: "pro" },
    data: {
      ...(priceIdYear && { stripePriceIdYear: priceIdYear }),
      ...(priceIdMonth && { stripePriceIdMonth: priceIdMonth }),
    },
  });

  console.log("Pro plan updated with Stripe Price IDs:");
  if (priceIdYear) console.log("  stripePriceIdYear:", priceIdYear);
  if (priceIdMonth) console.log("  stripePriceIdMonth:", priceIdMonth);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
