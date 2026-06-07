import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}

export const PRICES = {
  founder: process.env.STRIPE_PRICE_FOUNDER ?? "",
  pro:     process.env.STRIPE_PRICE_PRO     ?? "",
  agency:  process.env.STRIPE_PRICE_AGENCY  ?? "",
} as const;

export const PRICE_LABELS: Record<string, { tier: string; amount: string; reports: string }> = {
  [PRICES.founder]: { tier: "founder", amount: "$19", reports: "5" },
  [PRICES.pro]:     { tier: "pro",     amount: "$49", reports: "20" },
  [PRICES.agency]:  { tier: "agency",  amount: "$99", reports: "Unlimited" },
};
