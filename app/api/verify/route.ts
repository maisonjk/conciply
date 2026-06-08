import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license";
import { kvGet } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key: string = body.key ?? "";

  if (!key) return NextResponse.json({ error: "Key required." }, { status: 400 });

  // ── Path A: Stripe session ID (cs_...) ─────────────────────────────────────
  // After checkout, the unlock page sends the session ID, not a license key.
  // We look up the signed license key the webhook stored in KV, and return it
  // so the client can save the real key (not the session ID).
  if (key.startsWith("cs_")) {
    const licenseKey = await kvGet<string>(`license:${key}`);
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
