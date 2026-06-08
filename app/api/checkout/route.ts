import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES } from "@/lib/stripe";
import type { LicenseTier } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const tier = body.tier as LicenseTier;
  const annual = body.annual === true;

  // Try annual price first; fall back to monthly if annual env var not set
  const annualKey = `${tier}_annual` as keyof typeof PRICES;
  const monthlyKey = tier as keyof typeof PRICES;
  const priceId = annual
    ? (PRICES[annualKey] || PRICES[monthlyKey])
    : PRICES[monthlyKey];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      metadata: { tier },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Stripe error" }, { status: 500 });
  }
}
