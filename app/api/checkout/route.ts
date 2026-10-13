import { NextRequest, NextResponse } from "next/server";
import { getStripe, PRICES, PRICE_LABELS } from "@/lib/stripe";
import { LEGAL, renewalConsentText } from "@/lib/legal";
import type { LicenseTier } from "@/lib/types";

const TIERS: LicenseTier[] = ["founder", "pro", "agency"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const tier = body.tier as LicenseTier;
  const annual = body.annual === true;

  if (!TIERS.includes(tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  // Never silently charge a monthly price when the buyer picked annual.
  const priceId = annual ? PRICES[`${tier}_annual` as keyof typeof PRICES] : PRICES[tier];
  if (!priceId) {
    return NextResponse.json(
      { error: annual ? "Annual billing isn't available for this plan right now." : "Invalid tier." },
      { status: 400 },
    );
  }

  const interval = annual ? "annual" : "monthly";
  const amount = PRICE_LABELS[priceId]?.amount ?? "";
  const consentText = renewalConsentText(interval, amount);
  // Express consent is collected by Stripe Checkout itself (required checkbox
  // above the Pay button); Stripe stores the acceptance on the session as
  // consent.terms_of_service = "accepted". We keep the exact wording and version
  // alongside it (ARL: keep proof 3 years or 1 year after the contract ends).
  const consentMeta = {
    tier,
    interval,
    consent_method: "stripe_checkout_terms_checkbox",
    consent_version: LEGAL.consentVersion,
    consent_price: amount,
    consent_text: consentText.slice(0, 500),
  };

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "amazon_pay"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/unlock?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      metadata: consentMeta,
      subscription_data: {
        // Cancellations take effect at end of billing period. Customers keep access they paid for.
        metadata: consentMeta,
      },
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: { message: consentText },
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Checkout is unavailable right now. Please try again." }, { status: 500 });
  }
}
