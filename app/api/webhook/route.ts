import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { signLicense } from "@/lib/license";
import { kvSet } from "@/lib/kv";
import Stripe from "stripe";
import type { LicenseTier } from "@/lib/types";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const tier = session.metadata?.tier as LicenseTier | undefined;
    if (!tier) return NextResponse.json({ ok: true });

    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? "";

    const licenseKey = signLicense(tier, 0, customerId);
    await kvSet(`license:${session.id}`, licenseKey);
  }

  return NextResponse.json({ ok: true });
}
