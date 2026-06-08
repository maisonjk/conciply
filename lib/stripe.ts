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
  founder:        process.env.STRIPE_PRICE_FOUNDER         ?? "",
  pro:            process.env.STRIPE_PRICE_PRO             ?? "",
  agency:         process.env.STRIPE_PRICE_AGENCY          ?? "",
  founder_annual: process.env.STRIPE_PRICE_FOUNDER_ANNUAL  ?? "",
  pro_annual:     process.env.STRIPE_PRICE_PRO_ANNUAL      ?? "",
  agency_annual:  process.env.STRIPE_PRICE_AGENCY_ANNUAL   ?? "",
} as const;

export const PRICE_LABELS: Record<string, { tier: string; amount: string; reports: string }> = {
  [PRICES.founder]:        { tier: "founder", amount: "$19",  reports: "5" },
  [PRICES.pro]:            { tier: "pro",     amount: "$49",  reports: "20" },
  [PRICES.agency]:         { tier: "agency",  amount: "$99",  reports: "Unlimited" },
  [PRICES.founder_annual]: { tier: "founder", amount: "$190", reports: "5" },
  [PRICES.pro_annual]:     { tier: "pro",     amount: "$468", reports: "20" },
  [PRICES.agency_annual]:  { tier: "agency",  amount: "$948", reports: "Unlimited" },
};
