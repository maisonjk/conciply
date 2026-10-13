import { NextRequest, NextResponse } from "next/server";
import { verifyLicense, signLicense } from "@/lib/license";
import { kvGet, kvSet } from "@/lib/kv";
import { getStripe } from "@/lib/stripe";
import type { LicenseTier } from "@/lib/types";

const TIERS: LicenseTier[] = ["founder", "pro", "agency"];

async function licenseFromStripeSession(sessionId: string): Promise<string | null> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const paid = session.status === "complete" &&
      (session.payment_status === "paid" || session.payment_status === "no_payment_required");
    const tier = session.metadata?.tier as LicenseTier | undefined;
    if (session.mode !== "subscription" || !paid || !tier || !TIERS.includes(tier)) return null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? "";
    const licenseKey = signLicense(tier, 0, customerId);
    await kvSet(`license:${sessionId}`, licenseKey).catch(() => {});
    if (customerId) await kvSet(`customer:${customerId}`, licenseKey).catch(() => {});
    return licenseKey;
  } catch (err) {
    console.error("[verify] Stripe session lookup failed", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key ?? "";

  if (!key) return NextResponse.json({ error: "Key required." }, { status: 400 });

  // ── Path A: Stripe session ID (cs_...) ─────────────────────────────────────
  // After checkout, the unlock page sends the session ID, not a license key.
  // We look up the signed license key the webhook stored in KV, and return it
  // so the client can save the real key (not the session ID).
  if (key.startsWith("cs_")) {
    let licenseKey = await kvGet<string>(`license:${key}`);
    // Fallback: if the webhook hasn't stored a key (missed event, delay, KV
    // outage), confirm the payment directly with Stripe and issue the same key
    // the webhook would have. signLicense is deterministic, so both paths agree.
    if (!licenseKey) licenseKey = await licenseFromStripeSession(key);
    if (!licenseKey) {
      // Webhook may not have fired yet — tell the client to retry
      return NextResponse.json({ error: "License not ready yet.", retry: true }, { status: 202 });
    }
    const license = verifyLicense(licenseKey);
    if (!license) return NextResponse.json({ error: "Invalid license." }, { status: 403 });
    // Return the actual signed key so the client stores it
    return NextResponse.json({ tier: license.tier, licenseKey, reportCount: license.reportCount });
  }

  // ── Path B: Manual key entry ────────────────────────────────────────────────
  const revoked = await kvGet<boolean>(`revoked:${key}`);
  if (revoked) return NextResponse.json({ error: "License revoked." }, { status: 403 });

  const license = verifyLicense(key);
  if (!license) return NextResponse.json({ error: "Invalid license key." }, { status: 403 });

  return NextResponse.json({ tier: license.tier, reportCount: license.reportCount });
}
