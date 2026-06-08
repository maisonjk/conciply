import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { signLicense } from "@/lib/license";
import { kvSet, kvGet } from "@/lib/kv";
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

  switch (event.type) {

    // ── New subscription purchased ────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const tier = session.metadata?.tier as LicenseTier | undefined;
      if (!tier) break;

      const customerId = typeof session.customer === "string"
        ? session.customer
        : (session.customer as Stripe.Customer)?.id ?? "";

      const licenseKey = signLicense(tier, 0, customerId);

      // Store session → licenseKey (for /unlock flow)
      await kvSet(`license:${session.id}`, licenseKey);
      // Store customerId → licenseKey (for revocation lookups)
      if (customerId) await kvSet(`customer:${customerId}`, licenseKey);
      break;
    }

    // ── Subscription cancelled or expired ─────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      await revokeByCustomer(customerId, "subscription_cancelled");
      break;
    }

    // ── Subscription paused (payment failed repeatedly) ───────────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "canceled") {
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await revokeByCustomer(customerId, `subscription_${sub.status}`);
      }
      break;
    }

    // ── Dispute opened (chargeback) ───────────────────────────────────────
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const charge = await getStripe().charges.retrieve(dispute.charge as string);
      const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id ?? "";
      if (customerId) await revokeByCustomer(customerId, "dispute");
      break;
    }

    // ── Refund issued ─────────────────────────────────────────────────────
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      // Only revoke on full refunds
      if (charge.refunded) {
        const customerId = typeof charge.customer === "string" ? charge.customer : charge.customer?.id ?? "";
        if (customerId) await revokeByCustomer(customerId, "refunded");
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}

// Look up the license key for a customer and mark it revoked
async function revokeByCustomer(customerId: string, reason: string): Promise<void> {
  const licenseKey = await kvGet<string>(`customer:${customerId}`);
  if (licenseKey) {
    await kvSet(`revoked:${licenseKey}`, reason);
  }
}
