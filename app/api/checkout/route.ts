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

  // California ARL: no subscription without express affirmative consent to the renewal terms.
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please agree to the renewal terms to continue." }, { status: 400 });
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
  const consentAt = new Date().toISOString();
  // Proof of consent, kept with the Stripe record (ARL requires 3 years or 1 year after the contract ends).
  const consentMeta = {
    tier,
    interval,
    consent_at: consentAt,
    consent_version: LEGAL.consentVersion,
    consent_price: amount,
    consent_text: renewalConsentText(interval).slice(0, 500),
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
      custom_text: {
        submit: {
          message:
            `Renews automatically every ${annual ? "year" : "month"}${amount ? ` at ${amount}` : ""} until you cancel. ` +
            `Cancel anytime at conciply.com/manage.`,
        },
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Checkout is unavailable right now. Please try again." }, { status: 500 });
  }
}
